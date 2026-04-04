import express from 'express';
import { getEventStats, exportCsv } from '../controllers/adminController.js';
import { authenticateJWT, isCoordinator } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateJWT, isCoordinator);

router.get('/event-stats', getEventStats);
router.get('/export-csv/:eventId', exportCsv);

export default router;
