import express from 'express';
import passport from '../utils/passport.js';
import { googleCallback, localLogin, localSignup, onboard, getProfile, logout, refresh, updateProfile, changePassword } from '../controllers/authController.js';
import { authenticateJWT } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleCallback);

router.post('/login', authLimiter, localLogin);
router.post('/signup', authLimiter, localSignup);
router.post('/onboard', authenticateJWT, onboard);
router.post('/logout', logout);
router.get('/refresh-token', refresh);
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);
router.put('/change-password', authenticateJWT, authLimiter, changePassword);

export default router;
