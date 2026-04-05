import express from 'express';
import multer from 'multer';
import { getEventStats, exportCsv, getUsers, updateUserRole, getAttendees, exportAttendeesCsv, verifyEventEntry, getMyManagedEvents, assignVolunteerToEvent, removeVolunteerFromEvent, getVolunteerAssignments } from '../controllers/adminController.js';
import { createEvent, updateEvent, deleteEvent } from '../controllers/adminEventController.js';
import { uploadChunk } from '../controllers/uploadController.js';
import { createGalleryItem, deleteGalleryItem } from '../controllers/galleryController.js';
import { authenticateJWT, isCoordinator, isVolunteer, isSuperCoordinator, isPlatformAdmin } from '../middlewares/auth.js';

const router = express.Router();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Only JPEG, PNG, WEBP, GIF, and PDF are allowed.`));
        }
    }
});

router.get('/event-stats', authenticateJWT, isCoordinator, getEventStats);
router.get('/export-csv/:eventId', authenticateJWT, isCoordinator, exportCsv);

router.get('/users', authenticateJWT, isSuperCoordinator, getUsers);
router.put('/role', authenticateJWT, isSuperCoordinator, updateUserRole);

// Event Management (Platform Admin Only)
router.post('/events', authenticateJWT, isPlatformAdmin, createEvent);
router.put('/events/:eventId', authenticateJWT, isPlatformAdmin, updateEvent);
router.delete('/events/:eventId', authenticateJWT, isPlatformAdmin, deleteEvent);

// Chunk Upload
router.post('/upload-chunk', authenticateJWT, isPlatformAdmin, upload.single('chunk'), uploadChunk);

// Gallery management
router.post('/gallery', authenticateJWT, isPlatformAdmin, upload.single('galleryImage'), createGalleryItem);
router.delete('/gallery/:id', authenticateJWT, isPlatformAdmin, deleteGalleryItem);

// Attendee Registry (Volunteer, Coordinator & Admin)
router.get('/attendees', authenticateJWT, isVolunteer, getAttendees);
router.get('/attendees/export', authenticateJWT, isVolunteer, exportAttendeesCsv);

// ── SCANNER RBAC MODULE ───────────────────────────────────────
// Verify ticket entry — accessible to all scanning staff (Volunteer+)
router.post('/verify-entry', authenticateJWT, isVolunteer, verifyEventEntry);

// Get events this volunteer is authorized to scan (personalized dropdown)
router.get('/my-managed-events', authenticateJWT, isVolunteer, getMyManagedEvents);

// Volunteer-Event assignment management (Coordinator with privileges, or Super Admin)
router.get('/volunteer-assignments', authenticateJWT, isSuperCoordinator, getVolunteerAssignments);
router.post('/assign-volunteer', authenticateJWT, isSuperCoordinator, assignVolunteerToEvent);
router.delete('/remove-assignment', authenticateJWT, isSuperCoordinator, removeVolunteerFromEvent);

export default router;
