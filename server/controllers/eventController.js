import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
const prisma = new PrismaClient();

export const getEvents = async (req, res) => {
    try {
        const events = await prisma.event.findMany();
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

export const registerForEvent = async (req, res) => {
    try {
        const { eventId } = req.body;
        const userId = req.user.id;

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { registrations: true }
        });

        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (event.registrations.length >= event.capacity) return res.status(400).json({ error: 'Event is at full capacity' });

        const existing = await prisma.registration.findFirst({
            where: { userId, eventId }
        });
        if (existing) return res.status(400).json({ error: 'Already registered for this event' });

        const registration = await prisma.registration.create({
            data: { userId, eventId }
        });

        res.status(201).json(registration);
    } catch (err) {
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const getUserRegistrations = async (req, res) => {
    try {
        const userId = req.user.id;
        const registrations = await prisma.registration.findMany({
            where: { userId },
            include: { event: true }
        });
        
        const registrationsWithQR = await Promise.all(registrations.map(async (reg) => {
            const ticketData = JSON.stringify({ r: reg.id, u: reg.userId, e: reg.eventId });
            const qrImage = await QRCode.toDataURL(ticketData);
            return { ...reg, qrImage };
        }));

        res.json(registrationsWithQR);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user registrations' });
    }
};

export const verifyTicket = async (req, res) => {
    try {
        const { ticketData } = req.body;
        let qrPayload;
        try { qrPayload = JSON.parse(ticketData); } catch(e) { return res.status(400).json({ valid: false, error: 'Invalid QR string' }) }
        
        const registrationId = qrPayload.r;
        
        if (!registrationId) return res.status(400).json({ valid: false, error: 'Missing registration info' });

        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
            include: { user: true, event: true }
        });

        if (!registration) return res.status(404).json({ valid: false, error: 'Registration not found' });
        if (registration.scanned) return res.status(200).json({ valid: false, error: 'Ticket already scanned' });

        await prisma.registration.update({
            where: { id: registrationId },
            data: { scanned: true }
        });

        res.json({ valid: true, user: registration.user.name, event: registration.event.title });
    } catch (err) {
        res.status(500).json({ error: 'Ticket verification failed' });
    }
};
