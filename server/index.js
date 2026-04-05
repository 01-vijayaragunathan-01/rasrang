import dotenv from 'dotenv';
dotenv.config();

// --- PROCESS-LEVEL RESILIENCE SHIELD ---
// Prevent total system collapse from unexpected errors outside the request cycle
process.on('unhandledRejection', (reason, promise) => {
    logger.error('CRITICAL: Unhandled Rejection at Promise', { 
        reason: reason instanceof Error ? reason.message : reason, 
        stack: reason instanceof Error ? reason.stack : undefined 
    });
    // In production, we might want to gracefully shutdown if state is corrupted,
    // but in development/this environment, we log it and keep the server alive.
});

process.on('uncaughtException', (err) => {
    logger.error('CRITICAL: Uncaught Exception detected!', { 
        error: err.message, 
        stack: err.stack 
    });
    // For extreme safety, some teams exit here. We'll log and keep running unless it's fatal.
});


import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from './utils/passport.js';

import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/upload.js';
import galleryRoutes from './routes/galleryRoutes.js';
import { initMinio } from './utils/minio.js';
import logger from './utils/logger.js';
import requestLogger from './middlewares/requestLogger.js';
import { globalLimiter } from './middlewares/rateLimiter.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── ENTERPRISE CORS CONFIGURATION ───
const allowedOrigins = [
    'http://localhost:5173',       // Local Vite Development
    'http://127.0.0.1:5173',       // Local IP Alternative
    process.env.CLIENT_URL,        // Your Production Frontend URL
    process.env.ADMIN_URL          // Optional: If you host your admin dashboard on a different subdomain
].filter(Boolean);                 // Removes any undefined/null values

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests, or same-origin calls)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            logger.warn(`Blocked CORS request from unauthorized origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,                               // IMPORTANT: Required for cookies, sessions, and Passport.js
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Restrict to only the methods you actually use
    allowedHeaders: [
        'Origin', 
        'X-Requested-With', 
        'Content-Type', 
        'Accept', 
        'Authorization', 
        'x-csrf-token'                               // IMPORTANT: Required for your ticket registration route!
    ],
    exposedHeaders: ['set-cookie'],                  // Allows the frontend browser to see the cookie being set
    maxAge: 86400                                    // PERFORMANCE: Caches preflight (OPTIONS) requests for 24 hours
};

app.set('trust proxy', 1); // Trust the first proxy/load balancer (Required for Rate Limiting & Cookies behind Cloudflare/Render)

// Apply Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); // H-5 FIX: Prevent oversized JSON payload attacks
app.use(cookieParser());
app.use(globalLimiter);

// --- ADVANCED LOGGING INFRA --- (M-1 FIX: Restored)
app.use(requestLogger);

// Initialize Passport
app.use(passport.initialize());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/gallery', galleryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'RasRang API is running smoothly' });
});

app.get((req, res) => {
    res.json({ status: 'OK', message: 'RasRang API is running smoothly' });
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    // 1. Handle CORS errors gracefully
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ 
            error: 'Uplink Rejection: Origin blocked by security policy.',
            origin: req.get('origin')
        });
    }

    // 2. Handle Prisma specific errors if database connection drops
    if (err.code && err.code.startsWith('P')) {
        logger.error(`[DATABASE ERROR] ${err.code}`, { error: err.message, requestId: req.requestId });
        return res.status(503).json({ error: "Database synchronization failure. Please try again soon." });
    }

    // 3. Log the general error with full context
    logger.error(`[GLOBAL ERROR] ${req.method} ${req.url}`, {
        error: err.message,
        stack: err.stack,
        requestId: req.requestId,
        body: req.method !== 'GET' ? req.body : undefined // Be careful not to log passwords!
    });
    
    // 4. Ensure we don't try to send multiple responses
    if (res.headersSent) {
        return next(err);
    }

    // 5. Mission Failure Response
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Mission Critical: Internal Server Failure',
        code: statusCode === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, async () => {
    logger.info(`RasRang Backend Powering Up on port ${PORT} 🚀`);
    await initMinio();
});