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

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:5173', // Adjust to your frontend URL
    credentials: true,               // IMPORTANT: Must be true for cookie support
}));
app.use(express.json());
app.use(cookieParser());

// --- ADVANCED LOGGING INFRA ---
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
