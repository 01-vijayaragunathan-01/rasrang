import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const TICKET_SECRET = process.env.TICKET_SECRET || 'super_secret_festival_key';

export const getEvents = async (req, res) => {
    console.log(`[eventController] getEvents → request received`);
    try {
        const events = await prisma.event.findMany();
        console.log(`[eventController] getEvents → success: returned ${events.length} events`);
        res.json(events);
    } catch (err) {
        console.error('[eventController] getEvents → ERROR:', err);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

// ==========================================
// 1. SECURE REGISTRATION (With Concurrency Control)
// ==========================================
export const registerForEvent = async (req, res) => {
    const { eventId } = req.body;
    const userId = req.user.id;
    console.log(`[eventController] registerForEvent → user: ${userId} attempting to register for event: ${eventId}`);
    try {
        // 1. Verify Event Exists
        const event = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            console.log(`[eventController] registerForEvent → NOT FOUND: eventId ${eventId}`);
            return res.status(404).json({ error: 'Event not found' });
        }

        // 2. Check for Duplicate Registration
        const existing = await prisma.registration.findUnique({
            where: { userId_eventId: { userId, eventId } }
        });

        if (existing) {
            console.log(`[eventController] registerForEvent → DUPLICATE: user ${userId} already registered for event ${eventId}`);
            return res.status(400).json({ error: 'Already registered for this event' });
        }

        // 3. Create Registration
        const registration = await prisma.registration.create({
            data: { userId, eventId }
        });

        console.log(`[eventController] registerForEvent → success: registration created with id: ${registration.id} for user ${userId} / event ${eventId}`);
        res.status(201).json(registration);
    } catch (err) {
        console.error(`[eventController] registerForEvent → ERROR for user ${userId} / event ${eventId}:`, err.message);
        const status = err.message === 'Event not found' ? 404 : 400;
        res.status(status).json({ error: err.message || 'Registration failed' });
    }
};

// ==========================================
// 2. SECURE TICKET GENERATION
// ==========================================
export const getUserRegistrations = async (req, res) => {
    const userId = req.user.id;
    console.log(`[eventController] getUserRegistrations → called by user: ${userId}`);
    try {
        const registrations = await prisma.registration.findMany({
            where: { userId },
            include: { event: true }
        });

        console.log(`[eventController] getUserRegistrations → found ${registrations.length} registrations for user ${userId}`);
        
        // Generate Signed Individual Tickets
        const individualTickets = await Promise.all(registrations.map(async (reg) => {
            const signedPayload = jwt.sign({ r: reg.id, u: reg.userId, e: reg.eventId, type: 'individual' }, TICKET_SECRET);
            const qrImage = await QRCode.toDataURL(signedPayload);
            return { ...reg, qrImage };
        }));

        console.log(`[eventController] getUserRegistrations → generated ${individualTickets.length} individual tickets`);

        // Build Signed Master Tickets Grouped by Date
        const registrationsByDate = {};
        registrations.forEach(r => {
            if (!registrationsByDate[r.event.date]) {
                registrationsByDate[r.event.date] = [];
            }
            registrationsByDate[r.event.date].push(r);
        });

        const masterTickets = await Promise.all(Object.keys(registrationsByDate).map(async date => {
            const signedPayload = jwt.sign({ u: userId, d: date, type: 'master' }, TICKET_SECRET);
            const qrImage = await QRCode.toDataURL(signedPayload);
            return {
                date,
                events: registrationsByDate[date].map(r => r.event.title),
                qrImage
            };
        }));

        console.log(`[eventController] getUserRegistrations → success: generated ${masterTickets.length} master tickets for user ${userId}`);
        res.json({ individualTickets, masterTickets });
    } catch (err) {
        console.error(`[eventController] getUserRegistrations → ERROR for user ${userId}:`, err);
        res.status(500).json({ error: 'Failed to fetch user registrations' });
    }
};

// ==========================================
// 3. SECURE VERIFICATION LOGIC
// ==========================================
export const verifyTicket = async (req, res) => {
    const { selectedEventId } = req.body;
    const scannerUserId = req.user?.id;
    console.log(`[eventController] verifyTicket → scan initiated by volunteer: ${scannerUserId} | selectedEventId: ${selectedEventId || 'none (initial scan)'}`);
    try {
        const { ticketData } = req.body;
        let qrPayload;
        
        // Decrypt and Verify the Signature
        try { 
            qrPayload = jwt.verify(ticketData, TICKET_SECRET);
            console.log(`[eventController] verifyTicket → JWT verified | type: "${qrPayload.type}"`);
        } catch(e) { 
            console.log(`[eventController] verifyTicket → FRAUD DETECTED: JWT verification failed | error: ${e.message}`);
            return res.status(403).json({ valid: false, error: 'Fraudulent or corrupted ticket detected' }); 
        }
        
        // Handling Master Pass
        if (qrPayload.type === 'master') {
            const { u: userId, d: date } = qrPayload;
            console.log(`[eventController] verifyTicket → MASTER PASS | userId: ${userId} | date: ${date}`);
            
            // Volunteer is scanning the master pass for the first time
            if (!selectedEventId) {
                console.log(`[eventController] verifyTicket → initial master scan, fetching event list for user ${userId} on date ${date}`);
                const regs = await prisma.registration.findMany({
                    where: { userId, event: { date: date } },
                    include: { event: true, user: true }
                });
                
                if (regs.length === 0) {
                    console.log(`[eventController] verifyTicket → NO REGISTRATIONS for user ${userId} on date ${date}`);
                    return res.status(404).json({ valid: false, error: 'No registrations for this date' });
                }
                
                console.log(`[eventController] verifyTicket → success: master pass prompt | user: ${regs[0].user.name} | events: ${regs.map(r => r.event.title).join(', ')}`);
                return res.json({ 
                    valid: true,
                    isMasterPrompt: true, 
                    user: regs[0].user.name, 
                    events: regs.map(r => ({ id: r.eventId, title: r.event.title, scanned: r.scanned, regId: r.id }))
                });
            }

            // Volunteer selected the specific event from the master list
            console.log(`[eventController] verifyTicket → master pass: checking entry for event ${selectedEventId}`);
            const reg = await prisma.registration.findUnique({
                where: { userId_eventId: { userId, eventId: selectedEventId } },
                include: { event: true }
            });

            if (!reg) {
                console.log(`[eventController] verifyTicket → NOT REGISTERED: user ${userId} not registered for event ${selectedEventId}`);
                return res.status(404).json({ valid: false, error: 'Not registered for this specific event' });
            }
            
            if (reg.event.date !== date) {
                console.log(`[eventController] verifyTicket → DATE MISMATCH: pass date "${date}" vs event date "${reg.event.date}"`);
                return res.status(400).json({ valid: false, error: 'Event date mismatch' });
            }
            if (reg.scanned) {
                console.log(`[eventController] verifyTicket → ALREADY SCANNED: registration ${reg.id} for event ${selectedEventId}`);
                return res.status(200).json({ valid: false, error: 'Event already scanned' });
            }
            
            await prisma.registration.update({ where: { id: reg.id }, data: { scanned: true } });
            console.log(`[eventController] verifyTicket → success: MASTER PASS entry granted for event "${reg.event.title}"`);
            return res.json({ valid: true, message: 'Master Pass Verified for Event' });
        }
        
        // Handling Individual Ticket
        const registrationId = qrPayload.r;
        console.log(`[eventController] verifyTicket → INDIVIDUAL TICKET | registrationId: ${registrationId}`);
        if (!registrationId) {
            console.log(`[eventController] verifyTicket → INVALID: missing registrationId in payload`);
            return res.status(400).json({ valid: false, error: 'Missing registration info' });
        }

        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
            include: { user: true, event: true }
        });

        if (!registration) {
            console.log(`[eventController] verifyTicket → NOT FOUND: registrationId ${registrationId}`);
            return res.status(404).json({ valid: false, error: 'Registration not found' });
        }
        if (registration.scanned) {
            console.log(`[eventController] verifyTicket → ALREADY SCANNED: ticket for user ${registration.user.name} / event ${registration.event.title}`);
            return res.status(200).json({ valid: false, error: 'Ticket already scanned' });
        }

        await prisma.registration.update({ where: { id: registrationId }, data: { scanned: true } });

        console.log(`[eventController] verifyTicket → success: INDIVIDUAL ticket verified | user: ${registration.user.name} | event: ${registration.event.title}`);
        res.json({ valid: true, user: registration.user.name, event: registration.event.title });
    } catch (err) {
        console.error('[eventController] verifyTicket → ERROR:', err);
        res.status(500).json({ error: 'Ticket verification failed' });
    }
};

// ==========================================
// 4. SECURE TICKET DOWNLOADS
// ==========================================
export const downloadIndividualTicket = async (req, res) => {
    const { regId } = req.params;
    console.log(`[eventController] downloadIndividualTicket → user: ${req.user?.id} downloading ticket for regId: ${regId}`);
    try {
        const reg = await prisma.registration.findUnique({
            where: { id: regId, userId: req.user.id },
            include: { event: true, user: true }
        });
        if (!reg) {
            console.log(`[eventController] downloadIndividualTicket → NOT FOUND: regId ${regId} for user ${req.user?.id}`);
            return res.status(404).json({ error: 'Registration not found' });
        }
        
        console.log(`[eventController] downloadIndividualTicket → generating QR for event: "${reg.event.title}"`);
        const signedPayload = jwt.sign({ r: reg.id, u: reg.userId, e: reg.eventId, type: 'individual' }, TICKET_SECRET);
        const buffer = await QRCode.toBuffer(signedPayload, { width: 300 });
        console.log(`[eventController] downloadIndividualTicket → success: ticket PNG sent for event "${reg.event.title}"`);
        res.type('image/png');
        res.setHeader('Content-Disposition', `attachment; filename=ticket-${reg.event.title.replace(/\s+/g, '-')}.png`);
        res.send(buffer);
    } catch(err) {
        console.error(`[eventController] downloadIndividualTicket → ERROR for regId ${regId}:`, err);
        res.status(500).json({ error: 'Download failed' });
    }
};

export const downloadMasterTicket = async (req, res) => {
    const { date } = req.params;
    console.log(`[eventController] downloadMasterTicket → user: ${req.user?.id} downloading master pass for date: ${date}`);
    try {
        const signedPayload = jwt.sign({ u: req.user.id, d: date, type: 'master' }, TICKET_SECRET);
        const buffer = await QRCode.toBuffer(signedPayload, { width: 400 });
        console.log(`[eventController] downloadMasterTicket → success: master pass PNG sent for date ${date}`);
        res.type('image/png');
        res.setHeader('Content-Disposition', `attachment; filename=master-pass-${date.replace(/\s+/g, '-')}.png`);
        res.send(buffer);
    } catch(err) {
        console.error(`[eventController] downloadMasterTicket → ERROR for date ${date}:`, err);
        res.status(500).json({ error: 'Download failed' });
    }
};
