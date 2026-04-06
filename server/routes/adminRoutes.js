import express from 'express';
import multer from 'multer';
// UPDATED IMPORTS: Swapped CSV functions for the new Excel functions
import { 
    getEventStats, 
    exportEventExcel, // <-- Updated here
    getUsers, 
    updateUserRole, 
    updateUserDetails, 
    resetUserPassword, 
    deleteUser, 
    getAttendees, 
    exportAttendeesExcel, // <-- Updated here
    verifyEventEntry, 
    getMyManagedEvents, 
    assignVolunteerToEvent, 
    removeVolunteerFromEvent, 
    getVolunteerAssignments, 
    getDashboardOverview 
} from '../controllers/adminController.js';
import { createEvent, updateEvent, deleteEvent } from '../controllers/adminEventController.js';
import { uploadChunk } from '../controllers/uploadController.js';
import { createGalleryItem, deleteGalleryItem } from '../controllers/galleryController.js';
import { authenticateJWT, isCoordinator, isVolunteer, isSuperCoordinator, isPlatformAdmin } from '../middlewares/auth.js';
import { globalLimiter, scannerLimiter } from '../middlewares/rateLimiter.js';

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

// Chunks should not be strictly filtered by mimetype because blobs often default to octet-stream
const chunkUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB per chunk
});

router.get('/event-stats', authenticateJWT, isCoordinator, getEventStats);
// UPDATED ROUTE: Changed to export-excel
router.get('/export-excel/:eventId', authenticateJWT, isCoordinator, exportEventExcel);

router.get('/users', authenticateJWT, isSuperCoordinator, getUsers);
router.put('/role', authenticateJWT, isSuperCoordinator, updateUserRole);
router.put('/users/:userId', authenticateJWT, isSuperCoordinator, updateUserDetails);
router.post('/reset-password', authenticateJWT, isSuperCoordinator, resetUserPassword);
router.delete('/users/:userId', authenticateJWT, isSuperCoordinator, deleteUser);
// Add this line where your other GET routes are defined
router.get('/overview-stats', authenticateJWT, isVolunteer, getDashboardOverview);

// Event Management (Platform Admin Only)
router.post('/events', authenticateJWT, isPlatformAdmin, createEvent);
router.put('/events/:eventId', authenticateJWT, isPlatformAdmin, updateEvent);
router.delete('/events/:eventId', authenticateJWT, isPlatformAdmin, deleteEvent);

// Chunk Upload
router.post('/upload-chunk', authenticateJWT, isPlatformAdmin, chunkUpload.single('chunk'), uploadChunk);

// Gallery management
router.post('/gallery', authenticateJWT, isPlatformAdmin, upload.single('galleryImage'), createGalleryItem);
router.delete('/gallery/:id', authenticateJWT, isPlatformAdmin, deleteGalleryItem);

// Attendee Registry (Volunteer, Coordinator & Admin)
router.get('/attendees', authenticateJWT, isVolunteer, getAttendees);
// UPDATED ROUTE: Changed to export-excel
router.get('/attendees/export-excel', authenticateJWT, isVolunteer, exportAttendeesExcel);

// ── SCANNER RBAC MODULE ───────────────────────────────────────
// Verify ticket entry — accessible to all scanning staff (Volunteer+)
router.post('/verify-entry', authenticateJWT, isVolunteer, scannerLimiter, verifyEventEntry);

// Get events this volunteer is authorized to scan (personalized dropdown)
router.get('/my-managed-events', authenticateJWT, isVolunteer, getMyManagedEvents);

// Volunteer-Event assignment management (Coordinator with privileges, or Super Admin)
router.get('/volunteer-assignments', authenticateJWT, isSuperCoordinator, getVolunteerAssignments);
router.post('/assign-volunteer', authenticateJWT, isSuperCoordinator, assignVolunteerToEvent);
router.delete('/remove-assignment', authenticateJWT, isSuperCoordinator, removeVolunteerFromEvent);

export default router;