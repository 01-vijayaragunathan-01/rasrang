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
