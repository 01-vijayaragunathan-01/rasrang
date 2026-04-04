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
