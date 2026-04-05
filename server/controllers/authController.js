import jwt from 'jsonwebtoken';
import passport from '../utils/passport.js';
import bcrypt from 'bcryptjs';
import { sendTokenResponse, generateTokens } from '../utils/tokenProvider.js';
import prisma from '../db.js'; // H-1 FIX: Shared Prisma singleton
import logger from '../utils/logger.js';

export const googleCallback = async (req, res) => {
    const { accessToken, refreshToken, csrfToken } = generateTokens(req.user);

    logger.info(`Google Callback: Successful entry for ${req.user.id}`, { requestId: req.requestId });
    await prisma.user.update({
        where: { id: req.user.id },
        data: { refreshToken }
    });

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    };

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, cookieOptions);

    // H-4 FIX: Pass CSRF token via a short-lived secure cookie instead of URL query param
    // This prevents it from leaking into browser history, logs, or Referer headers
    res.cookie('_csrf_init', csrfToken, {
        httpOnly: false, // Must be readable by JS so frontend can pick it up
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 1000 // 1 minute — frontend must read and discard this immediately
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const redirectUrl = req.user.isOnboarded 
        ? `${clientUrl}/` 
        : `${clientUrl}/onboarding`;

    res.redirect(redirectUrl);
};

export const localSignup = async (req, res) => {
    logger.info(`Local Signup attempt for: ${req.body.email}`, { requestId: req.requestId });
    try {
        const { name, email, password, regNo, clgName, year, dept, branch, section, phoneNo } = req.body;

        if (!name || !email || !password || !regNo || !phoneNo) {
            logger.warn(`Signup validation failed: Missing required fields`, { requestId: req.requestId });
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { regNo }, { phoneNo }]
            }
        });

        if (existingUser) {
            logger.warn(`Signup conflict: User already exists for email/reg/phone`, { requestId: req.requestId });
            return res.status(400).json({ error: 'User with email, registration number, or phone number already exists' });
        }

        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const pepper = process.env.BCRYPT_SECRET || '';
        const hashedPassword = await bcrypt.hash(password + pepper, saltRounds);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                regNo,
                clgName,
                year,
                dept,
                branch,
                section,
                phoneNo,
                avatarSeed: req.body.avatarSeed || email,
                isOnboarded: true,
            }
        });

        logger.info(`Signup SUCCESS: User ${newUser.id} created`, { requestId: req.requestId });
        await sendTokenResponse(prisma, newUser, 201, res);
    } catch (err) {
        logger.error(`Signup failed: Unhandled exception`, { error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Signup failed' });
    }
};

export const onboard = async (req, res) => {
    logger.info(`Onboarding process started`, { userId: req.user.id, requestId: req.requestId });
    try {
        const userId = req.user.id;
        const { regNo, clgName, year, dept, branch, section, phoneNo, avatarSeed } = req.body;

        if (!regNo || !phoneNo) {
            logger.warn(`Onboard validation failed: missing regNo/phoneNo`, { requestId: req.requestId });
            return res.status(400).json({ error: 'Registration number and phone number are required' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            logger.warn(`Onboard: user not found: ${userId}`, { requestId: req.requestId });
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (user.isOnboarded) {
             return res.status(400).json({ error: 'User is already onboarded' });
        }

        const existing = await prisma.user.findFirst({
            where: {
                id: { not: userId },
                OR: [{ regNo }, { phoneNo }]
            }
        });

        if (existing) {
            logger.warn(`Onboarding conflict: RegNo/Phone already in use`, { userId, requestId: req.requestId });
            return res.status(400).json({ error: 'Registration number or Phone number already in use by another user' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { regNo, clgName, year, dept, branch, section, phoneNo, avatarSeed, isOnboarded: true }
        });

        logger.info(`Onboarding SUCCESS for user ${userId}`, { requestId: req.requestId });
        res.json({ success: true, message: 'Onboarding complete', user: { id: updatedUser.id, role: updatedUser.role, name: updatedUser.name, isOnboarded: updatedUser.isOnboarded } });
    } catch (err) {
        logger.error(`Onboarding failed`, { userId: req.user.id, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Onboarding failed' });
    }
};

export const localLogin = (req, res, next) => {
    logger.info(`Local auth: Intercepting login credentials`, { requestId: req.requestId });
    passport.authenticate('local', { session: false }, async (err, user, info) => {
        if (err) {
            logger.error(`Passport authentication crash`, { error: err.message, requestId: req.requestId });
            return next(err);
        }
        if (!user) {
            logger.warn(`Authentication failed: User unauthorized`, { ...info, requestId: req.requestId });
            return res.status(401).json(info);
        }

        logger.info(`Authentication SUCCESS for user ${user.id}`, { requestId: req.requestId });
        await sendTokenResponse(prisma, user, 200, res);
    })(req, res, next);
};

export const getProfile = (req, res) => {
    res.json({ 
        ...req.user, 
        csrfToken: req.csrfToken 
    });
};

export const refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'Session expired' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret');
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user || user.refreshToken !== refreshToken) {
            logger.warn(`Refresh failed: Invalid/mismatched session for ${decoded.id}`, { requestId: req.requestId });
            return res.status(401).json({ error: 'Invalid session' });
        }

        logger.info(`Session Refresh: Token re-issued for ${user.id}`, { requestId: req.requestId });
        await sendTokenResponse(prisma, user, 200, res);
    } catch (err) {
        logger.error(`Token refresh failed`, { error: err.message, requestId: req.requestId });
        res.status(401).json({ error: 'Refresh failed' });
    }
};

export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret');
            await prisma.user.update({
                where: { id: decoded.id },
                data: { refreshToken: null } 
            });
            logger.info(`Logout verification: Token purged for ${decoded.id}`, { requestId: req.requestId });
        } catch (e) {
            logger.warn(`Logout: Background token cleanup failed`, { error: e.message, requestId: req.requestId });
        }
    }

    // M-2 FIX: clearCookie must use the same options it was set with
    const cookieClearOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };
    res.clearCookie('accessToken', cookieClearOptions);
    res.clearCookie('refreshToken', cookieClearOptions);
    res.json({ success: true, message: 'Logged out successfully' });
};

export const updateProfile = async (req, res) => {
    logger.info(`Profile update initiated`, { userId: req.user.id, requestId: req.requestId });
    try {
        const userId = req.user.id;
        const { clgName, year, dept, branch, section, avatarSeed } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { clgName, year, dept, branch, section, avatarSeed },
            // H-2 FIX: Only select safe, non-sensitive fields to return
            select: {
                id: true, name: true, email: true, role: true,
                regNo: true, clgName: true, year: true, dept: true,
                branch: true, section: true, avatarSeed: true, isOnboarded: true
            }
        });

        logger.info(`Profile Update: SUCCESS for user ${userId}`, { requestId: req.requestId });
        res.json({ success: true, message: 'Profile updated', user: updatedUser });
    } catch (err) {
        logger.error(`Profile Update failed`, { userId: req.user.id, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Profile update failed' });
    }
};

export const changePassword = async (req, res) => {
    logger.info(`Password Change: Initiated for user ${req.user.id}`, { requestId: req.requestId });
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new passwords are required' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.password) {
            logger.warn(`Password Change: User or password field missing for ${userId}`, { requestId: req.requestId });
            return res.status(404).json({ error: 'User not found or using Google Auth' });
        }

        // Verify current password with pepper
        const pepper = process.env.BCRYPT_SECRET || '';
        const match = await bcrypt.compare(currentPassword + pepper, user.password);
        if (!match) {
            logger.warn(`Password Change: INCORRECT current password for ${userId}`, { requestId: req.requestId });
            return res.status(401).json({ error: 'Incorrect current password' });
        }

        // Hash new password with pepper and salt rounds
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(newPassword + pepper, saltRounds);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        logger.info(`Password Change: SUCCESS for user ${userId}`, { requestId: req.requestId });
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        logger.error(`Password Change: Unexpected error`, { userId: req.user.id, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to update password' });
    }
};

