import express from 'express';
import multer from 'multer';
import { getEventStats, exportCsv, getUsers, updateUserRole } from '../controllers/adminController.js';
import { createEvent, updateEvent, deleteEvent } from '../controllers/adminEventController.js';
import { createGalleryItem, deleteGalleryItem } from '../controllers/galleryController.js';
import { authenticateJWT, isCoordinator, isSuperCoordinator, isPlatformAdmin } from '../middlewares/auth.js';

const router = express.Router();

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/event-stats', authenticateJWT, isCoordinator, getEventStats);
router.get('/export-csv/:eventId', authenticateJWT, isCoordinator, exportCsv);

router.get('/users', authenticateJWT, isSuperCoordinator, getUsers);
router.put('/role', authenticateJWT, isSuperCoordinator, updateUserRole);

// Event Management (Platform Admin Only)
router.post('/events', authenticateJWT, isPlatformAdmin, upload.single('posterImage'), createEvent);
router.put('/events/:eventId', authenticateJWT, isPlatformAdmin, upload.single('posterImage'), updateEvent);
router.delete('/events/:eventId', authenticateJWT, isPlatformAdmin, deleteEvent);

// Gallery management
router.post('/gallery', authenticateJWT, isPlatformAdmin, upload.single('galleryImage'), createGalleryItem);
router.delete('/gallery/:id', authenticateJWT, isPlatformAdmin, deleteGalleryItem);

export default router;
