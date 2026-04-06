import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import { createCanvas, loadImage } from 'canvas'; 
import path from 'path'; 
import logger from '../utils/logger.js';
import prisma from '../db.js'; 

const TICKET_SECRET = process.env.TICKET_SECRET || 'super_secret_festival_key';

// ─── HELPER FUNCTION TO GENERATE QR WITH LOGO ───
const generateQRWithLogo = async (payload, width = 400) => {
    const canvas = createCanvas(width, width);
    await QRCode.toCanvas(canvas, payload, {
        width: width,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
    });

    const ctx = canvas.getContext('2d');
    const logoSize = width * 0.25; 
    const center = (width - logoSize) / 2;

    try {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(center - 5, center - 5, logoSize + 10, logoSize + 10, 10); 
        ctx.fill();

        const logoPath = path.resolve(process.cwd(), 'public', 'SRM_Logo.jpeg'); 
        const logo = await loadImage(logoPath);
        ctx.drawImage(logo, center, center, logoSize, logoSize);
    } catch (err) {
        logger.warn(`Could not load logo for QR generation. Defaulting to standard QR.`, { error: err.message });
    }

    return canvas.toBuffer('image/png');
};

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
// 1. SECURE REGISTRATION (Atomic)
// ==========================================
export const registerForEvent = async (req, res) => {
    const { eventId } = req.body;
    const userId = req.user.id;

    if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
        logger.warn(`Registration rejected: missing or invalid eventId`, { userId, requestId: req.requestId });
        return res.status(400).json({ error: 'A valid eventId is required' });
    }

    logger.info(`User ${userId} attempting to register for event ${eventId}`, { requestId: req.requestId });
    try {
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            logger.warn(`Registration failed: Event ${eventId} not found`, { requestId: req.requestId });
            return res.status(404).json({ error: 'Event not found' });
        }
        
        if (event.isRegistrationClosed) {
            logger.warn(`Registration blocked: Event ${eventId} is closed`, { userId, requestId: req.requestId });
            return res.status(403).json({ error: 'Registrations for this mission have concluded.' });
        }

        const registration = await prisma.registration.create({
            data: { userId, eventId }
        });

        logger.info(`Registration SUCCESS for user ${userId} / event ${eventId}`, { registrationId: registration.id, requestId: req.requestId });
        res.status(201).json({ success: true, message: 'Pass reserved successfully!', registrationId: registration.id });

    } catch (err) {
        if (err.code === 'P2002') {
            logger.warn(`Registration conflict: User ${userId} already registered for ${eventId}`, { requestId: req.requestId });
            return res.status(400).json({ error: 'Already registered for this event' });
        }
        logger.error(`Registration critical failure`, { userId, eventId, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
};

// ==========================================
// 2. SECURE TICKET GENERATION (Optimized for Frontend)
// ==========================================
export const getUserRegistrations = async (req, res) => {
    const userId = req.user.id;
    logger.info(`Fetching registrations for user ${userId}`, { requestId: req.requestId });
    try {
        const registrations = await prisma.registration.findMany({
            where: { userId },
            include: { event: true }
        });

        // Generate Long-Lived Tokens (48h) for Offline Downloads. No more server-side QR generation here!
        const individualTickets = registrations.map((reg) => {
            const token = jwt.sign({ r: reg.id, u: reg.userId, e: reg.eventId, type: 'individual' }, TICKET_SECRET, { expiresIn: '48h' });
            return { ...reg, token }; 
        });

        // Build Signed Master Tickets Grouped by Date
        const registrationsByDate = {};
        registrations.forEach(r => {
            if (!registrationsByDate[r.event.date]) {
                registrationsByDate[r.event.date] = [];
            }
            registrationsByDate[r.event.date].push(r);
        });

        const masterTickets = Object.keys(registrationsByDate).map(date => {
            const token = jwt.sign({ u: userId, d: date, type: 'master' }, TICKET_SECRET, { expiresIn: '48h' });
            return {
                date,
                events: registrationsByDate[date].map(r => r.event.title),
                token
            };
        });

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
// NEW: DYNAMIC LIVE TOKENS (Anti-Screenshot Logic)
// ==========================================
export const getLiveTokens = async (req, res) => {
    const userId = req.user.id;
    try {
        const registrations = await prisma.registration.findMany({
            where: { userId },
            include: { event: true }
        });

        // Generate Short-Lived Tokens (1 Minute Expiry)
        const individualTokens = {};
        registrations.forEach(reg => {
            individualTokens[reg.id] = jwt.sign({ r: reg.id, u: userId, e: reg.eventId, type: 'individual' }, TICKET_SECRET, { expiresIn: '1m' });
        });

        const registrationsByDate = {};
        registrations.forEach(r => {
            if (!registrationsByDate[r.event.date]) registrationsByDate[r.event.date] = [];
            registrationsByDate[r.event.date].push(r);
        });

        const masterTokens = {};
        Object.keys(registrationsByDate).forEach(date => {
            masterTokens[date] = jwt.sign({ u: userId, d: date, type: 'master' }, TICKET_SECRET, { expiresIn: '1m' });
        });

        res.json({ individualTokens, masterTokens });
    } catch (err) {
        logger.error(`Failed to refresh live tokens`, { error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to refresh live tokens' });
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
        
        try { 
            qrPayload = jwt.verify(ticketData, TICKET_SECRET);
        } catch(e) { 
            logger.error(`FRAUD DETECTED: JWT verification failed for ticket`, { error: e.message, requestId: req.requestId });
            return res.status(403).json({ valid: false, error: 'Fraudulent or expired ticket detected' }); 
        }
        
        // Handling Master Pass
        if (qrPayload.type === 'master') {
            const { u: userId, d: date } = qrPayload;
            
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
// 4. SECURE TICKET DOWNLOADS (Direct Backend APIs)
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
        const buffer = await generateQRWithLogo(signedPayload, 400); 
        
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
        const count = await prisma.registration.count({
            where: { userId: req.user.id, event: { date } }
        });
        if (count === 0) {
            logger.warn(`Master ticket download blocked: User ${req.user.id} has no registrations on ${date}`, { requestId: req.requestId });
            return res.status(403).json({ error: 'No registrations found for this date' });
        }

        const signedPayload = jwt.sign({ u: req.user.id, d: date, type: 'master' }, TICKET_SECRET, { expiresIn: '48h' });
        const buffer = await generateQRWithLogo(signedPayload, 400); 
        
        logger.info(`Master pass PNG sent successfully for date ${date}`, { requestId: req.requestId });
        res.type('image/png');
        res.setHeader('Content-Disposition', `attachment; filename=master-pass-${date.replace(/\s+/g, '-')}.png`);
        res.send(buffer);
    } catch(err) {
        logger.error(`Master pass download failed`, { date, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Download failed' });
    }
};