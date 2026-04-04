import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const TICKET_SECRET = process.env.TICKET_SECRET || 'super_secret_festival_key';

export const getEvents = async (req, res) => {
    try {
        const events = await prisma.event.findMany();
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

// ==========================================
// 1. SECURE REGISTRATION (With Concurrency Control)
// ==========================================
export const registerForEvent = async (req, res) => {
    try {
        const { eventId } = req.body;
        const userId = req.user.id;

        // Use a transaction to prevent race conditions
        const registration = await prisma.$transaction(async (tx) => {
            const event = await tx.event.findUnique({
                where: { id: eventId },
                include: { _count: { select: { registrations: true } } }
            });

            if (!event) throw new Error('Event not found');
            if (event._count.registrations >= event.capacity) throw new Error('Event is at full capacity');

            const existing = await tx.registration.findUnique({
                where: { userId_eventId: { userId, eventId } }
            });
            if (existing) throw new Error('Already registered for this event');

            return await tx.registration.create({
                data: { userId, eventId }
            });
        });

        res.status(201).json(registration);
    } catch (err) {
        const status = err.message === 'Event not found' ? 404 : 400;
        res.status(status).json({ error: err.message || 'Registration failed' });
    }
};

// ==========================================
// 2. SECURE TICKET GENERATION
// ==========================================
export const getUserRegistrations = async (req, res) => {
    try {
        const userId = req.user.id;
        const registrations = await prisma.registration.findMany({
            where: { userId },
            include: { event: true }
        });
        
        // Generate Signed Individual Tickets
        const individualTickets = await Promise.all(registrations.map(async (reg) => {
            // Sign the payload!
            const signedPayload = jwt.sign({ r: reg.id, u: reg.userId, e: reg.eventId, type: 'individual' }, TICKET_SECRET);
            const qrImage = await QRCode.toDataURL(signedPayload);
            return { ...reg, qrImage };
        }));

        // Build Signed Master Tickets Grouped by Date
        const registrationsByDate = {};
        registrations.forEach(r => {
            if (!registrationsByDate[r.event.date]) {
                registrationsByDate[r.event.date] = [];
            }
            registrationsByDate[r.event.date].push(r);
        });

        const masterTickets = await Promise.all(Object.keys(registrationsByDate).map(async date => {
            // Sign the master payload!
            const signedPayload = jwt.sign({ u: userId, d: date, type: 'master' }, TICKET_SECRET);
            const qrImage = await QRCode.toDataURL(signedPayload);
            return {
                date,
                events: registrationsByDate[date].map(r => r.event.title),
                qrImage
            };
        }));

        res.json({ individualTickets, masterTickets });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user registrations' });
    }
};

// ==========================================
// 3. SECURE VERIFICATION LOGIC
// ==========================================
export const verifyTicket = async (req, res) => {
    try {
        const { ticketData, selectedEventId } = req.body;
        let qrPayload;
        
        // Decrypt and Verify the Signature
        try { 
            qrPayload = jwt.verify(ticketData, TICKET_SECRET); 
        } catch(e) { 
            return res.status(403).json({ valid: false, error: 'Fraudulent or corrupted ticket detected' }); 
        }
        
        // Handling Master Pass
        if (qrPayload.type === 'master') {
            const { u: userId, d: date } = qrPayload;
            
            // Volunteer is scanning the master pass for the first time
            if (!selectedEventId) {
                const regs = await prisma.registration.findMany({
                    where: { userId, event: { date: date } },
                    include: { event: true, user: true }
                });
                
                if (regs.length === 0) return res.status(404).json({ valid: false, error: 'No registrations for this date' });
                
                return res.json({ 
                    valid: true,
                    isMasterPrompt: true, 
                    user: regs[0].user.name, 
                    events: regs.map(r => ({ id: r.eventId, title: r.event.title, scanned: r.scanned, regId: r.id }))
                });
            }

            // Volunteer selected the specific event from the master list
            const reg = await prisma.registration.findUnique({
                where: { userId_eventId: { userId, eventId: selectedEventId } },
                include: { event: true }
            });

            if (!reg) return res.status(404).json({ valid: false, error: 'Not registered for this specific event' });
            
            // Double check that the selected event actually matches the date on the master pass
            if (reg.event.date !== date) return res.status(400).json({ valid: false, error: 'Event date mismatch' });
            if (reg.scanned) return res.status(200).json({ valid: false, error: 'Event already scanned' });
            
            await prisma.registration.update({ where: { id: reg.id }, data: { scanned: true } });
            return res.json({ valid: true, message: 'Master Pass Verified for Event' });
        }
        
        // Handling Individual Ticket
        const registrationId = qrPayload.r;
        if (!registrationId) return res.status(400).json({ valid: false, error: 'Missing registration info' });

        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
            include: { user: true, event: true }
        });

        if (!registration) return res.status(404).json({ valid: false, error: 'Registration not found' });
        if (registration.scanned) return res.status(200).json({ valid: false, error: 'Ticket already scanned' });

        await prisma.registration.update({ where: { id: registrationId }, data: { scanned: true } });

        res.json({ valid: true, user: registration.user.name, event: registration.event.title });
    } catch (err) {
        res.status(500).json({ error: 'Ticket verification failed' });
    }
};

// ==========================================
// 4. SECURE TICKET DOWNLOADS
// ==========================================
export const downloadIndividualTicket = async (req, res) => {
    try {
        const { regId } = req.params;
        const reg = await prisma.registration.findUnique({
            where: { id: regId, userId: req.user.id },
            include: { event: true, user: true }
        });
        if (!reg) return res.status(404).json({ error: 'Registration not found' });
        
        // Now using Signed Payloads even for the image downloads
        const signedPayload = jwt.sign({ r: reg.id, u: reg.userId, e: reg.eventId, type: 'individual' }, TICKET_SECRET);
        const buffer = await QRCode.toBuffer(signedPayload, { width: 300 });
        res.type('image/png');
        res.setHeader('Content-Disposition', `attachment; filename=ticket-${reg.event.title.replace(/\s+/g, '-')}.png`);
        res.send(buffer);
    } catch(err) { res.status(500).json({ error: 'Download failed' }) }
};

export const downloadMasterTicket = async (req, res) => {
    try {
        const { date } = req.params;
        const signedPayload = jwt.sign({ u: req.user.id, d: date, type: 'master' }, TICKET_SECRET);
        const buffer = await QRCode.toBuffer(signedPayload, { width: 400 });
        res.type('image/png');
        res.setHeader('Content-Disposition', `attachment; filename=master-pass-${date.replace(/\s+/g, '-')}.png`);
        res.send(buffer);
    } catch(err) { res.status(500).json({ error: 'Download failed' }) }
};
