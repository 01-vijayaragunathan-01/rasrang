import { PrismaClient } from '@prisma/client';
import { uploadFile, deleteFile } from '../utils/minio.js';
import logger from '../utils/logger.js';
import prisma from '../db.js'; // H-1 FIX: Shared Prisma singleton

// ==========================================
// 1. CREATE EVENT (Admin Only)
// ==========================================
export const createEvent = async (req, res) => {
    const { title, category, description, date, time, isHeadliner, imageUrl, whatsappLink, venue, isRegistrationClosed } = req.body;
    logger.info(`Admin: Create Event initiated by ${req.user.id}`, { title, category, date, requestId: req.requestId });
    try {
        if (!title || !description || !date) {
            logger.warn(`Event creation failed: Missing required fields`, { requestId: req.requestId });
            return res.status(400).json({ error: "Missing required fields" });
        }

        // --- Type Casting for Prisma Stability ---
        const finalIsHeadliner = isHeadliner !== undefined ? (isHeadliner === 'true' || isHeadliner === true) : false;
        const finalIsRegistrationClosed = isRegistrationClosed !== undefined ? (isRegistrationClosed === 'true' || isRegistrationClosed === true) : false;

        const newEvent = await prisma.event.create({
            data: {
                title,
                category: category || 'General',
                description,
                date,
                time: time || null,
                imageUrl: imageUrl || null,
                whatsappLink: whatsappLink || null,
                venue: venue || null,
                isHeadliner: finalIsHeadliner,
                isRegistrationClosed: finalIsRegistrationClosed
            }
        });

        logger.info(`Event created successfully: "${newEvent.title}" (${newEvent.id})`, { requestId: req.requestId });
        res.status(201).json({ message: "Event created successfully", event: newEvent });
    } catch (err) {
        logger.error(`Event creation critical failure`, { error: err.message, requestId: req.requestId });
        res.status(500).json({ error: `Failed to create event: ${err.message}` });
    }
};

// ==========================================
// 2. UPDATE EVENT (Admin Only)
// ==========================================
export const updateEvent = async (req, res) => {
    const { eventId } = req.params;
    const { title, category, description, date, time, isHeadliner, imageUrl, whatsappLink, venue, isRegistrationClosed } = req.body;
    logger.info(`Admin: Update Event requested`, { eventId, requestId: req.requestId });

    try {
        // Validate UUID format manually to prevent Prisma crash 500
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(eventId)) {
            logger.warn(`Update aborted: Invalid Event ID format ${eventId}`, { requestId: req.requestId });
            return res.status(400).json({ error: "System Error: Invalid Event ID format." });
        }

        const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
        if (!existingEvent) {
            logger.warn(`Update failed: Event ${eventId} not found`, { requestId: req.requestId });
            return res.status(404).json({ error: "Event not found" });
        }

        logger.info(`Processing update for event "${existingEvent.title}"`, { requestId: req.requestId });
        
        // --- Explicit Type Consolidation ---
        const finalIsHeadliner = isHeadliner !== undefined ? (isHeadliner === 'true' || isHeadliner === true) : existingEvent.isHeadliner;
        const finalIsRegistrationClosed = isRegistrationClosed !== undefined ? (isRegistrationClosed === 'true' || isRegistrationClosed === true) : existingEvent.isRegistrationClosed;
        
        const updateData = {
            title: title || existingEvent.title,
            category: category || existingEvent.category,
            description: description || existingEvent.description,
            date: date || existingEvent.date,
            time: time !== undefined ? time : existingEvent.time,
            imageUrl: imageUrl !== undefined ? imageUrl : existingEvent.imageUrl,
            whatsappLink: whatsappLink !== undefined ? whatsappLink : existingEvent.whatsappLink,
            venue: venue !== undefined ? venue : existingEvent.venue,
            isHeadliner: finalIsHeadliner,
            isRegistrationClosed: finalIsRegistrationClosed
        };

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: updateData
        });

        logger.info(`Event update SUCCESS: "${updatedEvent.title}"`, { requestId: req.requestId });
        res.status(200).json({ message: "Event updated", event: updatedEvent });
    } catch (err) {
        logger.error(`Event update critical failure`, { eventId, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: `Failed to update event: ${err.message}` });
    }
};

// ==========================================
// 3. DELETE EVENT (Admin Only)
// ==========================================
export const deleteEvent = async (req, res) => {
    const { eventId } = req.params;
    logger.warn(`Admin: DELETE Event request by ${req.user.id}`, { eventId, requestId: req.requestId });
    try {
        // Fetch to get imageUrl before deletion
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            logger.warn(`Delete failed: Event ${eventId} not found`, { requestId: req.requestId });
            return res.status(404).json({ error: "Event not found" });
        }

        console.log(`[adminEventController] deleteEvent → found event "${event.title}", proceeding with deletion...`);

        await prisma.event.delete({
            where: { id: eventId }
        });

        logger.info(`Event DB record deleted for "${event.title}"`, { requestId: req.requestId });

        // Background cleanup 
        if (event.imageUrl) {
            logger.info(`Triggered MinIO asset cleanup (image) for deleted event`, { url: event.imageUrl, requestId: req.requestId });
            deleteFile(event.imageUrl);
        }

        logger.info(`Event destruction complete: "${event.title}"`, { requestId: req.requestId });
        res.status(200).json({ message: "Event successfully deleted" });
    } catch (err) {
        logger.error(`Event deletion critical failure`, { eventId, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to delete event.' });
    }
};
