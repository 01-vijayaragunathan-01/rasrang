import jwt from 'jsonwebtoken';
import passport from '../utils/passport.js';
import bcrypt from 'bcryptjs';
import { sendTokenResponse, generateTokens } from '../utils/tokenProvider.js';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

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

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const redirectUrl = req.user.isOnboarded 
        ? `${clientUrl}/?csrf=${csrfToken}` 
        : `${clientUrl}/onboarding?csrf=${csrfToken}`;

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

        const hashedPassword = await bcrypt.hash(password, 10);

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
        res.status(500).json({ error: 'Signup failed', details: err.message });
    }
};

export const onboard = async (req, res) => {
    logger.info(`Onboarding process started`, { userId: req.user.id, requestId: req.requestId });
    try {
        const userId = req.user.id;
        const { regNo, clgName, year, dept, branch, section, phoneNo, avatarSeed } = req.body;

        if (!regNo || !phoneNo) {
            console.log(`[authController] onboard → VALIDATION FAILED: missing regNo/phoneNo`);
            return res.status(400).json({ error: 'Registration number and phone number are required' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            console.log(`[authController] onboard → NOT FOUND: userId ${userId}`);
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (user.isOnboarded) {
             return res.status(400).json({ error: 'User is already onboarded' });
        }

        // Check uniqueness of regNo and phoneNo
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
            data: {
                regNo,
                clgName,
                year,
                dept,
                branch,
                section,
                phoneNo,
                avatarSeed,
                isOnboarded: true
            }
        });

        logger.info(`Onboarding SUCCESS for user ${userId}`, { requestId: req.requestId });
        res.json({ success: true, message: 'Onboarding complete', user: { id: updatedUser.id, role: updatedUser.role, name: updatedUser.name, isOnboarded: updatedUser.isOnboarded } });
    } catch (err) {
        logger.error(`Onboarding failed`, { userId: req.user.id, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Onboarding failed', details: err.message });
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

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
};

export const updateProfile = async (req, res) => {
    console.log(`[authController] updateProfile → user: ${req.user.id}`);
    try {
        const userId = req.user.id;
        const { clgName, year, dept, branch, section, avatarSeed } = req.body;
        
        // Note: regNo and phoneNo are explicitly ignored/locked

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                clgName,
                year,
                dept,
                branch,
                section,
                avatarSeed
            }
        });

        logger.info(`Profile Update: SUCCESS for user ${userId}`, { requestId: req.requestId });
        res.json({ success: true, message: 'Profile updated', user: updatedUser });
    } catch (err) {
        logger.error(`Profile Update failed`, { userId: req.user.id, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Profile update failed', details: err.message });
    }
};
