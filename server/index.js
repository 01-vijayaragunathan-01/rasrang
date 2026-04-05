import dotenv from 'dotenv';
dotenv.config();

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

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    // If it's a CORS error, send a clean 403 response instead of a massive 500 crash
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'Origin blocked by CORS policy.' });
    }

    logger.error(`[GLOBAL ERROR HANDLER] ${req.method} ${req.url}`, {
        error: err.message,
        stack: err.stack,
        requestId: req.requestId
    });
    
    // Check if headers have already been sent to avoid "Unhandled Error" crashes
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, async () => {
    logger.info(`RasRang Backend Powering Up on port ${PORT} 🚀`);
    await initMinio();
});