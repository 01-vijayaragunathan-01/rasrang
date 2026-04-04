import { PrismaClient } from '@prisma/client';
import { uploadFile, deleteFile } from '../utils/minio.js';

const prisma = new PrismaClient();

// ==========================================
// 1. CREATE EVENT (Admin Only)
// ==========================================
export const createEvent = async (req, res) => {
    const { title, category, description, date, time, isHeadliner, imageUrl, rulebookUrl } = req.body;
    console.log(`[adminEventController] createEvent → called by user: ${req.user?.id}`);
    console.log(`[adminEventController] createEvent → payload:`, { title, category, date, time, isHeadliner, imageUrl, rulebookUrl });
    try {
        if (!title || !description || !date) {
            console.log(`[adminEventController] createEvent → validation failed: missing required fields`);
            return res.status(400).json({ error: "Missing required fields" });
        }

        // --- Type Casting for Prisma Stability ---
        const finalIsHeadliner = isHeadliner !== undefined ? (isHeadliner === 'true' || isHeadliner === true) : false;

        const newEvent = await prisma.event.create({
            data: {
                title,
                category: category || 'General',
                description,
                date,
                time: time || null,
                imageUrl: imageUrl || null,
                rulebookUrl: rulebookUrl || null,
                isHeadliner: finalIsHeadliner
            }
        });

        console.log(`[adminEventController] createEvent → success: created event "${newEvent.title}" with id: ${newEvent.id}`);
        res.status(201).json({ message: "Event created successfully", event: newEvent });
    } catch (err) {
        console.error("[adminEventController] createEvent → ERROR:", err);
        res.status(500).json({ error: `Failed to create event: ${err.message}` });
    }
};

// ==========================================
// 2. UPDATE EVENT (Admin Only)
// ==========================================
export const updateEvent = async (req, res) => {
    const { eventId } = req.params;
    const { title, category, description, date, time, isHeadliner, imageUrl, rulebookUrl } = req.body;
    console.log(`[adminEventController] updateEvent → id: ${eventId}`);
    console.log(`[adminEventController] updateEvent → bodyKeys: ${Object.keys(req.body)}`);

    try {
        // Validate UUID format manually to prevent Prisma crash 500
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(eventId)) {
            console.log(`[adminEventController] updateEvent → ERR: Invalid UUID format "${eventId}"`);
            return res.status(400).json({ error: "System Error: Invalid Event ID format." });
        }

        const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
        if (!existingEvent) {
            console.log(`[adminEventController] updateEvent → NOT FOUND: eventId ${eventId}`);
            return res.status(404).json({ error: "Event not found" });
        }

        console.log(`[adminEventController] updateEvent → processing update for "${existingEvent.title}"`);
        
        // --- Explicit Type Consolidation ---
        const finalIsHeadliner = isHeadliner !== undefined ? (isHeadliner === 'true' || isHeadliner === true) : existingEvent.isHeadliner;
        
        const updateData = {
            title: title || existingEvent.title,
            category: category || existingEvent.category,
            description: description || existingEvent.description,
            date: date || existingEvent.date,
            time: time !== undefined ? time : existingEvent.time,
            imageUrl: imageUrl !== undefined ? imageUrl : existingEvent.imageUrl,
            rulebookUrl: rulebookUrl !== undefined ? rulebookUrl : existingEvent.rulebookUrl,
            isHeadliner: finalIsHeadliner
        };

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: updateData
        });

        console.log(`[adminEventController] updateEvent → success: event "${updatedEvent.title}" (${eventId}) updated`);
        res.status(200).json({ message: "Event updated", event: updatedEvent });
    } catch (err) {
        console.error(`[adminEventController] updateEvent → ERROR for eventId ${eventId}:`, err);
        res.status(500).json({ error: `Failed to update event: ${err.message}` });
    }
};

// ==========================================
// 3. DELETE EVENT (Admin Only)
// ==========================================
export const deleteEvent = async (req, res) => {
    const { eventId } = req.params;
    console.log(`[adminEventController] deleteEvent → called by user: ${req.user?.id} for eventId: ${eventId}`);
    try {
        // Fetch to get imageUrl before deletion
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            console.log(`[adminEventController] deleteEvent → NOT FOUND: eventId ${eventId}`);
            return res.status(404).json({ error: "Event not found" });
        }

        console.log(`[adminEventController] deleteEvent → found event "${event.title}", proceeding with deletion...`);

        await prisma.event.delete({
            where: { id: eventId }
        });

        console.log(`[adminEventController] deleteEvent → DB record deleted for event "${event.title}" (${eventId})`);

        // Background cleanup 
        if (event.imageUrl) {
            console.log(`[adminEventController] deleteEvent → triggering MinIO cleanup for image: ${event.imageUrl}`);
            deleteFile(event.imageUrl);
        }
        if (event.rulebookUrl) {
            console.log(`[adminEventController] deleteEvent → triggering MinIO cleanup for rulebook: ${event.rulebookUrl}`);
            deleteFile(event.rulebookUrl);
        }

        console.log(`[adminEventController] deleteEvent → success: event "${event.title}" fully terminated`);
        res.status(200).json({ message: "Event successfully deleted" });
    } catch (err) {
        console.error(`[adminEventController] deleteEvent → ERROR for eventId ${eventId}:`, err);
        res.status(500).json({ error: 'Failed to delete event.' });
    }
};
