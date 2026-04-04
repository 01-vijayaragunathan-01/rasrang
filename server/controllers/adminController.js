import { PrismaClient } from '@prisma/client';
import { AsyncParser } from '@json2csv/node';
const prisma = new PrismaClient();

export const getEventStats = async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            include: {
                _count: {
                    select: { registrations: true }
                }
            }
        });
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

export const exportCsv = async (req, res) => {
    try {
        const { eventId } = req.params;
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
            return res.status(404).json({ error: 'No registrations found for this event' });
        }

        const parser = new AsyncParser();
        const csv = await parser.parse(csvData).promise();

        res.header('Content-Type', 'text/csv');
        res.attachment(`event-${eventId}-attendees.csv`);
        res.send(csv);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate CSV' });
    }
};

export const getUsers = async (req, res) => {
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
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { userId, role, canManagePrivileges } = req.body;

        const validRoles = ['STUDENT', 'VOLUNTEER', 'COORDINATOR', 'SUPER_ADMIN'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Only a SUPER_ADMIN can promote someone to SUPER_ADMIN
        if (role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
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

        res.json({ success: true, message: 'User role updated', user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user role', details: err.message });
    }
};
