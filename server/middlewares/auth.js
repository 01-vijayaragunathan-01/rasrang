import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

export const authenticateJWT = async (req, res, next) => {
    // 1. Get Access Token from Cookies
    const token = req.cookies.accessToken;
    // 2. Get CSRF Token from Header
    const csrfToken = req.headers['x-csrf-token'];

    if (!token) return res.status(401).json({ error: 'Not authorized, no token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        // Pass CSRF token to req for profile re-hydration
        req.csrfToken = decoded.csrf;

        // CSRF Verification: Only for mutating requests (POST, PUT, DELETE)
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            if (!csrfToken || csrfToken !== decoded.csrf) {
                logger.warn(`Security Event: CSRF Mismatch`, { requestId: req.requestId, ip: req.ip });
                return res.status(403).json({ error: 'CSRF token mismatch' });
            }
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (user) {
            req.user = user;
            next();
        } else {
            logger.warn(`Auth failed: Ghost user session detected for ${decoded.id}`, { requestId: req.requestId });
            res.status(401).json({ error: 'User no longer exists' });
        }
    } catch (error) {
        logger.error(`Authentication Middleware Error`, { error: error.message, requestId: req.requestId });
        // Access token expired - frontend should now hit /refresh-token
        res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
};

export const isVolunteer = (req, res, next) => {
    if (req.user && (req.user.role === 'VOLUNTEER' || req.user.role === 'COORDINATOR' || req.user.role === 'SUPER_ADMIN')) {
        next();
    } else {
        res.status(403).json({ message: 'Require Volunteer/Coordinator/Admin Role!' });
    }
};

export const isCoordinator = (req, res, next) => {
    if (req.user && (req.user.role === 'COORDINATOR' || req.user.role === 'SUPER_ADMIN')) {
        next();
    } else {
        res.status(403).json({ message: 'Require Coordinator/Admin Role!' });
    }
};

export const ensureOnboarded = (req, res, next) => {
    if (req.user && (req.user.isOnboarded || req.user.role === 'SUPER_ADMIN')) {
        next();
    } else {
        res.status(403).json({ message: 'Must complete onboarding profile before performing this action.' });
    }
};

export const isSuperCoordinator = (req, res, next) => {
    if (req.user && ((req.user.role === 'COORDINATOR' && req.user.canManagePrivileges) || req.user.role === 'SUPER_ADMIN')) {
        next();
    } else {
        res.status(403).json({ message: 'Require Coordinator Role with Privilege Management Access!' });
    }
};

export const isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'SUPER_ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Require Platform Super Admin Role!' });
    }
};

export const isPlatformAdmin = (req, res, next) => {
    if (req.user && ((req.user.role === 'COORDINATOR' && req.user.canManagePrivileges) || req.user.role === 'SUPER_ADMIN')) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied: Platform Admin privileges required.' });
    }
};
