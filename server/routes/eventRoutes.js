import express from 'express';
import { getEvents, registerForEvent, getUserRegistrations, verifyTicket } from '../controllers/eventController.js';
import { authenticateJWT, isVolunteer, ensureOnboarded } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getEvents);
router.post('/register', authenticateJWT, ensureOnboarded, registerForEvent);
router.get('/my-registrations', authenticateJWT, getUserRegistrations);
router.post('/verify-ticket', authenticateJWT, isVolunteer, verifyTicket);

export default router;
