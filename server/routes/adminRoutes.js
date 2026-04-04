import express from 'express';
import { getEventStats, exportCsv, getUsers, updateUserRole } from '../controllers/adminController.js';
import { authenticateJWT, isCoordinator, isSuperCoordinator } from '../middlewares/auth.js';

const router = express.Router();

router.get('/event-stats', authenticateJWT, isCoordinator, getEventStats);
router.get('/export-csv/:eventId', authenticateJWT, isCoordinator, exportCsv);

router.get('/users', authenticateJWT, isSuperCoordinator, getUsers);
router.put('/role', authenticateJWT, isSuperCoordinator, updateUserRole);

export default router;
