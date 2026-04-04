import { PrismaClient } from '@prisma/client';
import { uploadFile, deleteFile } from '../utils/minio.js';

const prisma = new PrismaClient();

// ==========================================
// 1. CREATE EVENT (Admin Only)
// ==========================================
export const createEvent = async (req, res) => {
    const { title, category, description, date, time, capacity, isHeadliner } = req.body;
    console.log(`[adminEventController] createEvent → called by user: ${req.user?.id}`);
    console.log(`[adminEventController] createEvent → payload:`, { title, category, date, time, capacity, isHeadliner, hasFile: !!req.file });
    try {
        if (!title || !description || !date || !capacity) {
            console.log(`[adminEventController] createEvent → validation failed: missing required fields`);
            return res.status(400).json({ error: "Missing required fields" });
        }

        let imageUrl = null;

        if (req.file) {
            console.log(`[adminEventController] createEvent → uploading image: ${req.file.originalname} (${req.file.mimetype})`);
            imageUrl = await uploadFile(
                req.file.buffer, 
                req.file.originalname, 
                req.file.mimetype
            );
            console.log(`[adminEventController] createEvent → image uploaded to: ${imageUrl}`);
        }

        const newEvent = await prisma.event.create({
            data: {
                title,
                category: category || 'General',
                description,
                date,
                time: time || null,
                capacity: parseInt(capacity, 10),
                imageUrl: imageUrl,
                isHeadliner: isHeadliner === 'true' || isHeadliner === true
            }
        });

        console.log(`[adminEventController] createEvent → success: created event "${newEvent.title}" with id: ${newEvent.id}`);
        res.status(201).json({ message: "Event created successfully", event: newEvent });
    } catch (err) {
        console.error("[adminEventController] createEvent → ERROR:", err);
        res.status(500).json({ error: 'Failed to create event' });
    }
};

// ==========================================
// 2. UPDATE EVENT (Admin Only)
// ==========================================
export const updateEvent = async (req, res) => {
    const { eventId } = req.params;
    const { title, category, description, date, time, capacity, isHeadliner } = req.body;
    console.log(`[adminEventController] updateEvent → called by user: ${req.user?.id} for eventId: ${eventId}`);
    console.log(`[adminEventController] updateEvent → payload:`, { title, category, date, time, capacity, isHeadliner, hasFile: !!req.file });
    try {
        const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
        if (!existingEvent) {
            console.log(`[adminEventController] updateEvent → NOT FOUND: eventId ${eventId}`);
            return res.status(404).json({ error: "Event not found" });
        }

        let imageUrl = existingEvent.imageUrl;

        if (req.file) {
            console.log(`[adminEventController] updateEvent → uploading new image: ${req.file.originalname}`);
            imageUrl = await uploadFile(
                req.file.buffer, 
                req.file.originalname, 
                req.file.mimetype
            );
            console.log(`[adminEventController] updateEvent → new image uploaded to: ${imageUrl}`);
        }

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: {
                title: title || existingEvent.title,
                category: category || existingEvent.category,
                description: description || existingEvent.description,
                date: date || existingEvent.date,
                time: time !== undefined ? time : existingEvent.time,
                capacity: capacity ? parseInt(capacity, 10) : existingEvent.capacity,
                imageUrl: imageUrl,
                isHeadliner: isHeadliner !== undefined ? (isHeadliner === 'true' || isHeadliner === true) : existingEvent.isHeadliner
            }
        });

        console.log(`[adminEventController] updateEvent → success: event "${updatedEvent.title}" (${eventId}) updated`);
        res.status(200).json({ message: "Event updated", event: updatedEvent });
    } catch (err) {
        console.error(`[adminEventController] updateEvent → ERROR for eventId ${eventId}:`, err);
        res.status(500).json({ error: 'Failed to update event' });
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

        console.log(`[adminEventController] deleteEvent → success: event "${event.title}" fully terminated`);
        res.status(200).json({ message: "Event successfully deleted" });
    } catch (err) {
        console.error(`[adminEventController] deleteEvent → ERROR for eventId ${eventId}:`, err);
        res.status(500).json({ error: 'Failed to delete event.' });
    }
};
