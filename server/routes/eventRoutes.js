import express from 'express';
import { getEvents, registerForEvent, getUserRegistrations, verifyTicket, downloadIndividualTicket, downloadMasterTicket } from '../controllers/eventController.js';
import { authenticateJWT, isVolunteer, ensureOnboarded } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getEvents);
router.post('/register', authenticateJWT, ensureOnboarded, registerForEvent);
router.get('/my-registrations', authenticateJWT, getUserRegistrations);
router.post('/verify-ticket', authenticateJWT, isVolunteer, verifyTicket);
router.get('/download-ticket/:regId', authenticateJWT, downloadIndividualTicket);
router.get('/download-master-ticket/:date', authenticateJWT, downloadMasterTicket);

export default router;
