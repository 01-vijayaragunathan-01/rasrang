import rateLimit from 'express-rate-limit';

// Global Rate Limiter: Applies to all API routes
// Strict enough to prevent mass scraping/DDoS, loose enough for normal browsing
// Global Rate Limiter
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Allows ~33 requests per minute. Safe for fast browsing!
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Whoa there! You are sending too many requests. Please take a breather and try again in 15 minutes.',
        status: 429
    }
});

// Auth Rate Limiter: Stricter limits applied to login/register endpoints
// Prevents brute forcing credentials and credential stuffing
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many authentication attempts from this IP, please try again after 15 minutes',
        status: 429
    }
});

// Scanner Rate Limiter: High throughput for staff/volunteers scanning tickets
// Allows ~66 scans per minute to accommodate peak crowd flow
export const scannerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, 
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Scanner throughput limit reached. Please wait a moment for the system to process.',
        status: 429
    }
});
