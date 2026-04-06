import { PrismaClient } from '@prisma/client';
import { AsyncParser } from '@json2csv/node';
import logger from '../utils/logger.js';
import prisma from '../db.js'; // H-1 FIX: Shared Prisma singleton
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const getEventStats = async (req, res) => {
    logger.info(`Admin stats request`, { userId: req.user.id, role: req.user.role, requestId: req.requestId });
    try {
        const events = await prisma.event.findMany({
            include: {
                _count: {
                    select: { registrations: true }
                }
            }
        });
        logger.info(`Event stats compiled for ${events.length} events`, { requestId: req.requestId });
        res.json(events);
    } catch (err) {
        logger.error(`Failed to fetch admin stats`, { error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

export const exportCsv = async (req, res) => {
    const { eventId } = req.params;
    logger.info(`Admin CSV export initiated`, { eventId, userId: req.user.id, requestId: req.requestId });
    try {
        const registrations = await prisma.registration.findMany({
            where: { eventId },
            include: { user: true }
        });

        const csvData = registrations.map(r => ({
            Name: r.user.name,
            Email: r.user.email,
            RegNo: r.user.regNo || 'N/A',
            Role: r.user.role,
            Scanned: r.scanned
        }));

        if (csvData.length === 0) {
            logger.warn(`CSV export aborted: No registrations for event ${eventId}`, { requestId: req.requestId });
            return res.status(404).json({ error: 'No registrations found for this event' });
        }

        const parser = new AsyncParser();
        const csv = await parser.parse(csvData).promise();

        logger.info(`CSV file generated successfully`, { rowCount: csvData.length, eventId, requestId: req.requestId });
        res.header('Content-Type', 'text/csv');
        res.attachment(`event-${eventId}-attendees.csv`);
        res.send(csv);
    } catch (err) {
        logger.error(`CSV export failure`, { eventId, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to generate CSV' });
    }
};

export const getUsers = async (req, res) => {
    logger.info(`Admin user list requested`, { userId: req.user.id, requestId: req.requestId });
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                regNo: true,
                role: true,
                canManagePrivileges: true,
                isOnboarded: true
            }
        });
        logger.info(`User directory compiled for ${users.length} unique identities`, { requestId: req.requestId });
        res.json(users);
    } catch (err) {
        logger.error(`Failed to fetch user directory`, { error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const updateUserRole = async (req, res) => {
    const { userId, role, canManagePrivileges } = req.body;
    logger.warn(`CRITICAL: User role update initiated`, { actor: req.user.id, target: userId, newRole: role, requestId: req.requestId });
    try {
        const validRoles = ['STUDENT', 'VOLUNTEER', 'COORDINATOR', 'SUPER_ADMIN'];
        if (!validRoles.includes(role)) {
            logger.warn(`Role update failed: Forbidden role name "${role}"`, { requestId: req.requestId });
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Only a SUPER_ADMIN can promote someone to SUPER_ADMIN
        if (role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            logger.error(`PRIVILEGE ESCALATION ATTEMPTED by ${req.user.id}`, { target: userId, requestId: req.requestId });
            return res.status(403).json({ error: 'Only Platform Admins can grant Super Admin status.' });
        }

        const dataToUpdate = {
            role,
            canManagePrivileges: (role === 'SUPER_ADMIN') ? true : (canManagePrivileges !== undefined ? canManagePrivileges : false)
        };

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate
        });

        // H-3 FIX: Only return safe fields, never expose password hash or refreshToken
        const { password, refreshToken, ...safeUser } = updatedUser;
        logger.info(`Role update SUCCESS: user ${userId} is now ${role}`, { requestId: req.requestId });
        res.json({ success: true, message: 'User role updated', user: safeUser });
    } catch (err) {
        logger.error(`Role update failure`, { userId, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to update user role', details: err.message });
    }
};

export const updateUserDetails = async (req, res) => {
    const { userId } = req.params;
    const { name, email, regNo } = req.body;
    logger.warn(`Admin detail update initiated`, { actor: req.user.id, target: userId, requestId: req.requestId });

    try {
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        // Update basic details
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, email, regNo },
            select: { id: true, name: true, email: true, regNo: true, role: true, canManagePrivileges: true }
        });

        logger.info(`Update SUCCESS: user ${userId} details refreshed`, { requestId: req.requestId });
        res.json({ success: true, message: 'User details updated', user: updatedUser });
    } catch (err) {
        logger.error(`User detail update failure`, { userId, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to update user details' });
    }
};

export const resetUserPassword = async (req, res) => {
    const { userId } = req.body;
    logger.warn(`CRITICAL: Administrative password reset initiated`, { actor: req.user.id, target: userId, requestId: req.requestId });
    
    try {
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) {
            return res.status(404).json({ error: 'Target user not found' });
        }

        // 🛡️ SECURITY CHECK: Only a SUPER_ADMIN can reset another SUPER_ADMIN's password.
        if (targetUser.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            logger.error(`UNAUTHORIZED RESET ATTEMPT by ${req.user.id} against ${userId}`, { requestId: req.requestId });
            return res.status(403).json({ error: 'Access denied: You cannot reset a Super Admin account.' });
        }

        // Generate temporary 8-character password
        const tempPassword = crypto.randomBytes(4).toString('hex');
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        const pepper = process.env.BCRYPT_SECRET || '';
        const hashedPassword = await bcrypt.hash(tempPassword + pepper, saltRounds);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword, isOnboarded: true } // Ensure user can login
        });

        logger.info(`Password Reset SUCCESS: user ${userId} now has temporary credentials`, { requestId: req.requestId });
        
        // Return the plain text password only now
        res.json({ 
            success: true, 
            message: 'Password reset successful', 
            tempPassword 
        });
    } catch (err) {
        logger.error(`Admin Password Reset failure`, { userId, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to reset password', details: err.message });
    }
};

export const deleteUser = async (req, res) => {
    const { userId } = req.params;
    logger.warn(`CRITICAL: User deletion initiated`, { actor: req.user.id, target: userId, requestId: req.requestId });

    try {
        if (req.user.id === userId) {
            return res.status(400).json({ error: 'Self-destruction sequence aborted. You cannot delete your own account.' });
        }

        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        // Security parity: Coordinator cannot delete Super Admin
        if (targetUser.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Access denied: You cannot delete a Super Admin account.' });
        }

        // Delete user (and all related records via Cascade delete in Prisma)
        await prisma.user.delete({ where: { id: userId } });

        logger.info(`Deletion SUCCESS: user ${userId} purged from platform`, { requestId: req.requestId });
        res.json({ success: true, message: 'User permanently deleted' });
    } catch (err) {
        logger.error(`User deletion failure`, { userId, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to delete user. Dependencies might exist.' });
    }
};

// ==========================================
// ATTENDEE REGISTRY MODULE
// ==========================================

// 1. GET ATTENDEES (With Event Filter & Search)
export const getAttendees = async (req, res) => {
    logger.info(`Attendee registry scan requested`, { userId: req.user.id, requestId: req.requestId });
    try {
        const { eventId, search } = req.query;

        // Base: users who have at least one registration
        let whereClause = { registrations: { some: {} } };

        // Filter by specific event
        if (eventId && eventId !== 'All') {
            whereClause.registrations.some = { eventId };
        }

        // Search by Name, RegNo, or Email
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { regNo: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const attendees = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                regNo: true,
                email: true,
                phoneNo: true,
                isOnboarded: true,
                isOnboarded: true,
                registrations: {
                    select: {
                        scanned: true,
                        event: { select: { id: true, title: true, category: true } }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        logger.info(`Attendee scan results: ${attendees.length} identities found`, { requestId: req.requestId });
        res.status(200).json(attendees);
    } catch (error) {
        logger.error(`Attendee registry scan failure`, { error: error.message, requestId: req.requestId });
        res.status(500).json({ error: "Failed to fetch attendees." });
    }
};

// 2. EXPORT ATTENDEES TO CSV (Server-side stream)
export const exportAttendeesCsv = async (req, res) => {
    logger.info(`Master attendee export requested`, { userId: req.user.id, requestId: req.requestId });
    try {
        const { eventId } = req.query;

        let whereClause = { registrations: { some: {} } };
        if (eventId && eventId !== 'All') {
            whereClause.registrations.some = { eventId };
        }

        const attendees = await prisma.user.findMany({
            where: whereClause,
            include: {
                registrations: { include: { event: true } }
            },
            orderBy: { name: 'asc' }
        });

        // Flatten data for CSV
        const csvData = attendees.map(user => {
            const registeredEvents = user.registrations.map(r => r.event.title).join(' | ');
            const eventsAttended = user.registrations.filter(r => r.scanned).length;

            return {
                "Full Name": user.name,
                "Register No": user.isOnboarded ? (user.regNo || "N/A") : "Incomplete Registration",
                "Email Address": user.email,
                "Phone": user.isOnboarded ? (user.phoneNo || "N/A") : "Pending Verification",
                "Total Registrations": user.registrations.length,
                "Events Attended": eventsAttended,
                "Registered Events": registeredEvents
            };
        });

        if (csvData.length === 0) {
            logger.warn(`Master CSV export aborted: No attendees found`, { requestId: req.requestId });
            return res.status(404).json({ error: "No attendees found for this filter." });
        }

        const parser = new AsyncParser();
        const csv = await parser.parse(csvData).promise();

        logger.info(`Master CSV successfully compiled`, { rowCount: csvData.length, requestId: req.requestId });
        res.header('Content-Type', 'text/csv');
        res.attachment(`RasRang-Attendees-${eventId && eventId !== 'All' ? eventId : 'All'}.csv`);
        res.send(csv);

    } catch (error) {
        logger.error(`Master CSV export failure`, { error: error.message, requestId: req.requestId });
        res.status(500).json({ error: "Failed to generate CSV." });
    }
};

// ============================================================
// DELEGATED SCANNER RBAC MODULE
// ============================================================

// 1. VERIFY TICKET ENTRY (QR scan or Manual Reg No)
export const verifyEventEntry = async (req, res) => {
    const { eventId, identifier } = req.body;
    const scannerId   = req.user.id;
    const scannerRole = req.user.role;
    logger.info(`Entry verification initiated`, { scannerId, eventId, identifier, requestId: req.requestId });

    if (!eventId || !identifier) {
        return res.status(400).json({ error: 'eventId and identifier are required.' });
    }

    try {
        // ── RBAC CHECK: Confirm this volunteer is authorized for this specific event ──
        if (scannerRole !== 'SUPER_ADMIN') {
            const assignment = await prisma.volunteerAssignment.findUnique({
                where: { volunteerId_eventId: { volunteerId: scannerId, eventId } }
            });
            if (!assignment) {
                logger.warn(`SECURITY: Unauthorized scan attempt by ${scannerId} on event ${eventId}`, { requestId: req.requestId });
                return res.status(403).json({ error: 'Access denied: You are not assigned to scan this event.' });
            }
        }

        // ── FIND USER: by UUID, RegNo, or Email (flexible manual lookup) ──
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: identifier },
                    { regNo: identifier },
                    { email: identifier }
                ]
            }
        });

        if (!user) {
            logger.warn(`Entry denied: identifier "${identifier}" not found in user base`, { requestId: req.requestId });
            return res.status(404).json({ error: 'User not found. Check the ID or Reg No and try again.' });
        }

        // ── FIND REGISTRATION ──
        const registration = await prisma.registration.findUnique({
            where: { userId_eventId: { userId: user.id, eventId } },
            include: { event: { select: { title: true, date: true } } }
        });

        if (!registration) {
            logger.warn(`Entry denied: User ${user.id} not registered for event ${eventId}`, { requestId: req.requestId });
            return res.status(403).json({ error: `Access Denied. "${user.name}" is NOT registered for this event.` });
        }

        // ── ALREADY SCANNED CHECK ──
        if (registration.scanned) {
            logger.warn(`Duplicate scan detected for user ${user.id} / event ${eventId}`, { requestId: req.requestId });
            return res.status(409).json({
                valid: false,
                alreadyScanned: true,
                error: `WARNING: Pass already used.`,
                attendee: { name: user.name, regNo: user.regNo, event: registration.event.title }
            });
        }

        // ── GRANT ENTRY ──
        await prisma.registration.update({
            where: { id: registration.id },
            data: { scanned: true }
        });

        logger.info(`Entry GRANTED: ${user.name} admitted to "${registration.event.title}"`, { requestId: req.requestId });
        return res.status(200).json({
            valid: true,
            message: 'Access Granted!',
            attendee: { name: user.name, regNo: user.regNo, event: registration.event.title, date: registration.event.date }
        });

    } catch (err) {
        logger.error(`Entry verification failure`, { error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Verification system error. Please try again.' });
    }
};

// 2. GET EVENTS THIS VOLUNTEER CAN SCAN (used to populate scanner dropdown)
export const getMyManagedEvents = async (req, res) => {
    const userId   = req.user.id;
    const userRole = req.user.role;
    logger.info(`Managed events request by ${userId}`, { role: userRole, requestId: req.requestId });

    try {
        // SUPER_ADMIN can scan everything
        if (userRole === 'SUPER_ADMIN') {
            const allEvents = await prisma.event.findMany({ orderBy: { date: 'asc' } });
            return res.status(200).json(allEvents);
        }

        // Others only see their assigned events
        const assignments = await prisma.volunteerAssignment.findMany({
            where: { volunteerId: userId },
            include: { event: true },
            orderBy: { event: { date: 'asc' } }
        });

        res.status(200).json(assignments.map(a => a.event));
    } catch (err) {
        logger.error(`Failed to fetch managed events`, { error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to fetch your assigned events.' });
    }
};

// 3. ASSIGN VOLUNTEER TO EVENT (Coordinator+ only)
export const assignVolunteerToEvent = async (req, res) => {
    const { volunteerId, eventId } = req.body;
    logger.info(`Assignment request`, { actor: req.user.id, volunteerId, eventId, requestId: req.requestId });

    if (!volunteerId || !eventId) {
        return res.status(400).json({ error: 'volunteerId and eventId are required.' });
    }

    try {
        // Verify target is a staff member (not a student)
        const target = await prisma.user.findUnique({ where: { id: volunteerId } });
        if (!target) return res.status(404).json({ error: 'Volunteer not found.' });
        if (target.role === 'STUDENT') {
            return res.status(400).json({ error: 'Students cannot be assigned as event scanners.' });
        }

        // Use upsert to make it idempotent (safe to call twice)
        await prisma.volunteerAssignment.upsert({
            where: { volunteerId_eventId: { volunteerId, eventId } },
            create: { volunteerId, eventId },
            update: {} // no-op if already assigned
        });

        logger.info(`Assignment SUCCESS: ${volunteerId} assigned to event ${eventId}`, { requestId: req.requestId });
        res.status(200).json({ success: true, message: `${target.name} assigned to event successfully.` });
    } catch (err) {
        logger.error(`Assignment failure`, { error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to assign volunteer.' });
    }
};

// 4. REMOVE VOLUNTEER FROM EVENT
export const removeVolunteerFromEvent = async (req, res) => {
    const { volunteerId, eventId } = req.body;
    logger.warn(`Deassignment request`, { actor: req.user.id, volunteerId, eventId, requestId: req.requestId });

    try {
        await prisma.volunteerAssignment.delete({
            where: { volunteerId_eventId: { volunteerId, eventId } }
        });

        logger.info(`Deassignment SUCCESS: ${volunteerId} removed from event ${eventId}`, { requestId: req.requestId });
        res.status(200).json({ success: true, message: 'Volunteer removed from event.' });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Assignment not found.' });
        }
        logger.error(`Deassignment failure`, { error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to remove assignment.' });
    }
};

// 5. GET ALL VOLUNTEERS WITH THEIR EVENT ASSIGNMENTS (for the assignment dashboard)
export const getVolunteerAssignments = async (req, res) => {
    logger.info(`Volunteer assignments overview requested`, { requestId: req.requestId });
    try {
        const volunteers = await prisma.user.findMany({
            where: { role: { in: ['VOLUNTEER', 'COORDINATOR'] } },
            select: {
                id: true,
                name: true,
                email: true,
                regNo: true,
                role: true,
                managedEvents: {
                    include: { event: { select: { id: true, title: true, date: true, category: true } } }
                }
            },
            orderBy: { name: 'asc' }
        });

        const events = await prisma.event.findMany({
            select: { id: true, title: true, date: true, category: true },
            orderBy: { date: 'asc' }
        });

        res.status(200).json({ volunteers, events });
    } catch (err) {
        logger.error(`Volunteer assignments fetch failure`, { error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to fetch assignments.' });
    }
};

