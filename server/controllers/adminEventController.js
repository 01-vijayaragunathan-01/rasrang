import { PrismaClient } from '@prisma/client';
import { uploadFile } from '../utils/minio.js';

const prisma = new PrismaClient();

// ==========================================
// 1. CREATE EVENT (Admin Only)
// ==========================================
export const createEvent = async (req, res) => {
    try {
        const { title, category, description, date, capacity } = req.body;

        if (!title || !description || !date || !capacity) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        let imageUrl = null;

        if (req.file) {
            imageUrl = await uploadFile(
                req.file.buffer, 
                req.file.originalname, 
                req.file.mimetype
            );
        }

        const newEvent = await prisma.event.create({
            data: {
                title,
                category: category || 'General',
                description,
                date,
                capacity: parseInt(capacity, 10),
                imageUrl: imageUrl 
            }
        });

        res.status(201).json({ message: "Event created successfully", event: newEvent });
    } catch (err) {
        console.error("Create Event Error:", err);
        res.status(500).json({ error: 'Failed to create event' });
    }
};

// ==========================================
// 2. UPDATE EVENT (Admin Only)
// ==========================================
export const updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { title, category, description, date, capacity } = req.body;

        const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
        if (!existingEvent) return res.status(404).json({ error: "Event not found" });

        let imageUrl = existingEvent.imageUrl;

        if (req.file) {
            imageUrl = await uploadFile(
                req.file.buffer, 
                req.file.originalname, 
                req.file.mimetype
            );
        }

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: {
                title: title || existingEvent.title,
                category: category || existingEvent.category,
                description: description || existingEvent.description,
                date: date || existingEvent.date,
                capacity: capacity ? parseInt(capacity, 10) : existingEvent.capacity,
                imageUrl: imageUrl
            }
        });

        res.status(200).json({ message: "Event updated", event: updatedEvent });
    } catch (err) {
        console.error("Update Event Error:", err);
        res.status(500).json({ error: 'Failed to update event' });
    }
};

// ==========================================
// 3. DELETE EVENT (Admin Only)
// ==========================================
export const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        await prisma.event.delete({
            where: { id: eventId }
        });

        res.status(200).json({ message: "Event successfully deleted" });
    } catch (err) {
        console.error("Delete Event Error:", err);
        res.status(500).json({ error: 'Failed to delete event. Ensure no users are registered first.' });
    }
};
