import { PrismaClient } from '@prisma/client';
import { AsyncParser } from '@json2csv/node';
const prisma = new PrismaClient();

export const getEventStats = async (req, res) => {
    console.log(`[adminController] getEventStats → called by user: ${req.user?.id} (${req.user?.role})`);
    try {
        const events = await prisma.event.findMany({
            include: {
                _count: {
                    select: { registrations: true }
                }
            }
        });
        console.log(`[adminController] getEventStats → success: returned ${events.length} events`);
        res.json(events);
    } catch (err) {
        console.error('[adminController] getEventStats → ERROR:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

export const exportCsv = async (req, res) => {
    const { eventId } = req.params;
    console.log(`[adminController] exportCsv → called by user: ${req.user?.id} for eventId: ${eventId}`);
    try {
        const registrations = await prisma.registration.findMany({
            where: { eventId },
            include: { user: true }
        });

        console.log(`[adminController] exportCsv → found ${registrations.length} registrations for event ${eventId}`);

        const csvData = registrations.map(r => ({
            Name: r.user.name,
            Email: r.user.email,
            RegNo: r.user.regNo || 'N/A',
            Role: r.user.role,
            Scanned: r.scanned
        }));

        if (csvData.length === 0) {
            console.log(`[adminController] exportCsv → no registrations found for event ${eventId}`);
            return res.status(404).json({ error: 'No registrations found for this event' });
        }

        const parser = new AsyncParser();
        const csv = await parser.parse(csvData).promise();

        console.log(`[adminController] exportCsv → success: CSV generated for event ${eventId}`);
        res.header('Content-Type', 'text/csv');
        res.attachment(`event-${eventId}-attendees.csv`);
        res.send(csv);
    } catch (err) {
        console.error(`[adminController] exportCsv → ERROR for eventId ${eventId}:`, err);
        res.status(500).json({ error: 'Failed to generate CSV' });
    }
};

export const getUsers = async (req, res) => {
    console.log(`[adminController] getUsers → called by user: ${req.user?.id} (${req.user?.role})`);
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
        console.log(`[adminController] getUsers → success: returned ${users.length} users`);
        res.json(users);
    } catch (err) {
        console.error('[adminController] getUsers → ERROR:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const updateUserRole = async (req, res) => {
    const { userId, role, canManagePrivileges } = req.body;
    console.log(`[adminController] updateUserRole → called by user: ${req.user?.id} | target: ${userId} | new role: ${role} | canManagePrivileges: ${canManagePrivileges}`);
    try {
        const validRoles = ['STUDENT', 'VOLUNTEER', 'COORDINATOR', 'SUPER_ADMIN'];
        if (!validRoles.includes(role)) {
            console.log(`[adminController] updateUserRole → invalid role attempted: "${role}"`);
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Only a SUPER_ADMIN can promote someone to SUPER_ADMIN
        if (role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            console.log(`[adminController] updateUserRole → FORBIDDEN: user ${req.user?.id} tried to grant SUPER_ADMIN`);
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

        console.log(`[adminController] updateUserRole → success: user ${userId} updated to role "${role}"`);
        res.json({ success: true, message: 'User role updated', user: updatedUser });
    } catch (err) {
        console.error(`[adminController] updateUserRole → ERROR for userId ${userId}:`, err);
        res.status(500).json({ error: 'Failed to update user role', details: err.message });
    }
};

// ==========================================
// ATTENDEE REGISTRY MODULE
// ==========================================

// 1. GET ATTENDEES (With Event Filter & Search)
export const getAttendees = async (req, res) => {
    console.log(`[adminController] getAttendees → called by user: ${req.user?.id} (${req.user?.role})`);
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
                registrations: {
                    select: {
                        scanned: true,
                        event: { select: { id: true, title: true, category: true } }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        console.log(`[adminController] getAttendees → success: returned ${attendees.length} attendees`);
        res.status(200).json(attendees);
    } catch (error) {
        console.error("[adminController] getAttendees → ERROR:", error);
        res.status(500).json({ error: "Failed to fetch attendees." });
    }
};

// 2. EXPORT ATTENDEES TO CSV (Server-side stream)
export const exportAttendeesCsv = async (req, res) => {
    console.log(`[adminController] exportAttendeesCsv → called by user: ${req.user?.id}`);
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
                "Register No": user.regNo || "N/A",
                "Email Address": user.email,
                "Phone": user.phoneNo || "N/A",
                "Total Registrations": user.registrations.length,
                "Events Attended": eventsAttended,
                "Registered Events": registeredEvents
            };
        });

        if (csvData.length === 0) {
            console.log(`[adminController] exportAttendeesCsv → no attendees found`);
            return res.status(404).json({ error: "No attendees found for this filter." });
        }

        const parser = new AsyncParser();
        const csv = await parser.parse(csvData).promise();

        console.log(`[adminController] exportAttendeesCsv → success: CSV generated with ${csvData.length} rows`);
        res.header('Content-Type', 'text/csv');
        res.attachment(`RasRang-Attendees-${eventId && eventId !== 'All' ? eventId : 'All'}.csv`);
        res.send(csv);

    } catch (error) {
        console.error("[adminController] exportAttendeesCsv → ERROR:", error);
        res.status(500).json({ error: "Failed to generate CSV." });
    }
};
