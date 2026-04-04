import jwt from 'jsonwebtoken';
import passport from '../utils/passport.js';
import bcrypt from 'bcryptjs';
import { sendTokenResponse, generateTokens } from '../utils/tokenProvider.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const googleCallback = async (req, res) => {
    const { accessToken, refreshToken, csrfToken } = generateTokens(req.user);

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

    res.redirect(`http://localhost:5173/login?csrf=${csrfToken}&onboarded=${req.user.isOnboarded}`);
};

export const localSignup = async (req, res) => {
    try {
        const { name, email, password, regNo, clgName, year, dept, branch, section, phoneNo } = req.body;

        if (!name || !email || !password || !regNo || !phoneNo) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { regNo }, { phoneNo }]
            }
        });

        if (existingUser) {
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
                isOnboarded: true,
            }
        });

        await sendTokenResponse(prisma, newUser, 201, res);
    } catch (err) {
        res.status(500).json({ error: 'Sigup failed', details: err.message });
    }
};

export const onboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const { regNo, clgName, year, dept, branch, section, phoneNo } = req.body;

        if (!regNo || !phoneNo) {
            return res.status(400).json({ error: 'Registration number and phone number are required' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
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
                isOnboarded: true
            }
        });

        res.json({ success: true, message: 'Onboarding complete', user: { id: updatedUser.id, role: updatedUser.role, name: updatedUser.name, isOnboarded: updatedUser.isOnboarded } });
    } catch (err) {
        res.status(500).json({ error: 'Onboarding failed', details: err.message });
    }
};

export const localLogin = (req, res, next) => {
    passport.authenticate('local', { session: false }, async (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json(info);

        await sendTokenResponse(prisma, user, 200, res);
    })(req, res, next);
};

export const getProfile = (req, res) => {
    res.json(req.user);
};

export const refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'Session expired' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret');
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        await sendTokenResponse(prisma, user, 200, res);
    } catch (err) {
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
        } catch (e) {
        }
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
};
