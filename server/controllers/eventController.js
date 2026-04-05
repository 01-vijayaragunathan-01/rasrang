import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import prisma from '../db.js'; // H-1 FIX: Shared Prisma singleton
const TICKET_SECRET = process.env.TICKET_SECRET || 'super_secret_festival_key';

export const getEvents = async (req, res) => {
    try {
        const events = await prisma.event.findMany();
        logger.info(`Fetched ${events.length} events from database`, { requestId: req.requestId });
        res.json(events);
    } catch (err) {
        logger.error(`Failed to fetch events`, { error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

// ==========================================
// 1. SECURE REGISTRATION (Atomic — Race-condition-safe)
// ==========================================
export const registerForEvent = async (req, res) => {
    const { eventId } = req.body;
    const userId = req.user.id;

    // CR-2 FIX: Validate eventId exists and is a non-empty string before touching the DB
    if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
        logger.warn(`Registration rejected: missing or invalid eventId`, { userId, requestId: req.requestId });
        return res.status(400).json({ error: 'A valid eventId is required' });
    }

    logger.info(`User ${userId} attempting to register for event ${eventId}`, { requestId: req.requestId });
    try {
        // 1. Verify Event Exists
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            logger.warn(`Registration failed: Event ${eventId} not found`, { requestId: req.requestId });
            return res.status(404).json({ error: 'Event not found' });
        }

        // CR-1 FIX: Collapsed the duplicate-check + create into one atomic operation.
        // We skip the pre-check findUnique entirely and rely on the DB's @@unique([userId, eventId])
        // constraint to reject duplicates. This eliminates the race-condition window where two
        // concurrent requests could both pass the check before either creates a record.
        const registration = await prisma.registration.create({
            data: { userId, eventId }
        });

        logger.info(`Registration SUCCESS for user ${userId} / event ${eventId}`, { registrationId: registration.id, requestId: req.requestId });
        // M-2 FIX: Return only the fields the frontend needs — not the full internal record
        res.status(201).json({ success: true, message: 'Pass reserved successfully!', registrationId: registration.id });

    } catch (err) {
        // CR-1 FIX: Prisma error code P2002 = unique constraint violation = already registered
        if (err.code === 'P2002') {
            logger.warn(`Registration conflict: User ${userId} already registered for ${eventId}`, { requestId: req.requestId });
            return res.status(400).json({ error: 'Already registered for this event' });
        }
        // H-2 FIX: Don't leak DB error internals to the client; log them server-side only
        logger.error(`Registration critical failure`, { userId, eventId, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
};


// ==========================================
// 2. SECURE TICKET GENERATION
// ==========================================
export const getUserRegistrations = async (req, res) => {
    const userId = req.user.id;
    logger.info(`Fetching registrations for user ${userId}`, { requestId: req.requestId });
    try {
        const registrations = await prisma.registration.findMany({
            where: { userId },
            include: { event: true }
        });

        logger.info(`Found ${registrations.length} registrations for user ${userId}`, { requestId: req.requestId });
        
        // Generate Signed Individual Tickets
        const individualTickets = await Promise.all(registrations.map(async (reg) => {
            // H-6 FIX: Tickets now expire after 48 hours — screenshots from weeks ago won't work
            const signedPayload = jwt.sign({ r: reg.id, u: reg.userId, e: reg.eventId, type: 'individual' }, TICKET_SECRET, { expiresIn: '48h' });
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
            const signedPayload = jwt.sign({ u: userId, d: date, type: 'master' }, TICKET_SECRET, { expiresIn: '48h' });
            const qrImage = await QRCode.toDataURL(signedPayload);
            return {
                date,
                events: registrationsByDate[date].map(r => r.event.title),
                qrImage
            };
        }));

        logger.info(`Tickets generated successfully for user ${userId}`, { 
            individualCount: individualTickets.length, 
            masterCount: masterTickets.length,
            requestId: req.requestId 
        });
        res.json({ individualTickets, masterTickets });
    } catch (err) {
        logger.error(`Failed to generate tickets for user ${userId}`, { error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to fetch user registrations' });
    }
};

// ==========================================
// 3. SECURE VERIFICATION LOGIC
// ==========================================
export const verifyTicket = async (req, res) => {
    const { selectedEventId } = req.body;
    const scannerUserId = req.user?.id;
    logger.info(`Ticket verification initiated by volunteer ${scannerUserId}`, { selectedEventId, requestId: req.requestId });
    try {
        const { ticketData } = req.body;
        let qrPayload;
        
        // Decrypt and Verify the Signature
        try { 
            qrPayload = jwt.verify(ticketData, TICKET_SECRET);
        } catch(e) { 
            logger.error(`FRAUD DETECTED: JWT verification failed for ticket`, { error: e.message, requestId: req.requestId });
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
                
                if (regs.length === 0) {
                    logger.warn(`Master scan: No registrations for user ${userId} on ${date}`, { requestId: req.requestId });
                    return res.status(404).json({ valid: false, error: 'No registrations for this date' });
                }
                
                logger.info(`Master pass prompt generated for user ${regs[0].user.name}`, { requestId: req.requestId });
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

            if (!reg) {
                logger.warn(`Master entry failed: User ${userId} not registered for ${selectedEventId}`, { requestId: req.requestId });
                return res.status(404).json({ valid: false, error: 'Not registered for this specific event' });
            }
            
            if (reg.event.date !== date) {
                logger.warn(`Master entry failed: Date mismatch ${date} vs ${reg.event.date}`, { requestId: req.requestId });
                return res.status(400).json({ valid: false, error: 'Event date mismatch' });
            }
            if (reg.scanned) {
                logger.warn(`Master entry failed: Already scanned for event ${selectedEventId}`, { requestId: req.requestId });
                return res.status(200).json({ valid: false, error: 'Event already scanned' });
            }
            
            await prisma.registration.update({ where: { id: reg.id }, data: { scanned: true } });
            logger.info(`Master pass entry GRANTED for user ${userId} / event "${reg.event.title}"`, { requestId: req.requestId });
            return res.json({ valid: true, message: 'Master Pass Verified for Event' });
        }
        
        // Handling Individual Ticket
        const registrationId = qrPayload.r;
        if (!registrationId) {
            logger.warn(`Verification failed: Missing registrationId in payload`, { requestId: req.requestId });
            return res.status(400).json({ valid: false, error: 'Missing registration info' });
        }

        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
            include: { user: true, event: true }
        });

        if (!registration) {
            logger.warn(`Verification failed: Registration ${registrationId} not found`, { requestId: req.requestId });
            return res.status(404).json({ valid: false, error: 'Registration not found' });
        }
        if (registration.scanned) {
            logger.warn(`Verification failed: Already scanned ticket for ${registration.user.name}`, { registrationId, requestId: req.requestId });
            return res.status(200).json({ valid: false, error: 'Ticket already scanned' });
        }

        await prisma.registration.update({ where: { id: registrationId }, data: { scanned: true } });

        logger.info(`Individual ticket VERIFIED for user ${registration.user.name} / event ${registration.event.title}`, { registrationId, requestId: req.requestId });
        res.json({ valid: true, user: registration.user.name, event: registration.event.title });
    } catch (err) {
        logger.error(`Ticket verification CRITICAL failure`, { error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Ticket verification failed' });
    }
};

// ==========================================
// 4. SECURE TICKET DOWNLOADS
// ==========================================
export const downloadIndividualTicket = async (req, res) => {
    const { regId } = req.params;
    try {
        const reg = await prisma.registration.findUnique({
            where: { id: regId, userId: req.user.id },
            include: { event: true, user: true }
        });
        if (!reg) {
            logger.warn(`Download failed: Registration ${regId} not found for user ${req.user.id}`, { requestId: req.requestId });
            return res.status(404).json({ error: 'Registration not found' });
        }
        
        const signedPayload = jwt.sign({ r: reg.id, u: reg.userId, e: reg.eventId, type: 'individual' }, TICKET_SECRET, { expiresIn: '48h' });
        const buffer = await QRCode.toBuffer(signedPayload, { width: 300 });
        
        logger.info(`Ticket PNG sent successfully for event "${reg.event.title}"`, { requestId: req.requestId });
        res.type('image/png');
        res.setHeader('Content-Disposition', `attachment; filename=ticket-${reg.event.title.replace(/\s+/g, '-')}.png`);
        res.send(buffer);
    } catch(err) {
        logger.error(`Download critical failure`, { regId, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Download failed' });
    }
};

export const downloadMasterTicket = async (req, res) => {
    const { date } = req.params;
    try {
        // M-3 FIX: Verify the user has at least one registration on this date
        // before issuing a signed master pass — prevents signing tokens for zero-registration dates
        const count = await prisma.registration.count({
            where: { userId: req.user.id, event: { date } }
        });
        if (count === 0) {
            logger.warn(`Master ticket download blocked: User ${req.user.id} has no registrations on ${date}`, { requestId: req.requestId });
            return res.status(403).json({ error: 'No registrations found for this date' });
        }

        const signedPayload = jwt.sign({ u: req.user.id, d: date, type: 'master' }, TICKET_SECRET, { expiresIn: '48h' });
        const buffer = await QRCode.toBuffer(signedPayload, { width: 400 });
        
        logger.info(`Master pass PNG sent successfully for date ${date}`, { requestId: req.requestId });
        res.type('image/png');
        res.setHeader('Content-Disposition', `attachment; filename=master-pass-${date.replace(/\s+/g, '-')}.png`);
        res.send(buffer);
    } catch(err) {
        logger.error(`Master pass download failed`, { date, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Download failed' });
    }
};
