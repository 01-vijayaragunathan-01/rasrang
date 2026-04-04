import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// --- CUSTOM LOG FORMATTING ---
const consoleFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${stack || message}`;
    
    // If request metadata exists, format it nicely
    if (metadata.method && metadata.url) {
        msg += ` | ${metadata.method} ${metadata.url} ${metadata.statusCode || ''} (${metadata.responseTime}ms) [IP: ${metadata.ip}]`;
    }
    
    if (metadata.requestId) {
        msg = `[${metadata.requestId}] ` + msg;
    }

    return msg;
});

// --- LOGGER CONFIGURATION ---
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }), // capture stack trace
        json() // default to JSON for file logs (better for parsing)
    ),
    transports: [
        // 1. CONSOLE TRANSPORT (Colorized & Human Readable)
        new winston.transports.Console({
            format: combine(
                colorize(),
                consoleFormat
            )
        }),

        // 2. DAILY ROTATE FILE (Combined Logs)
        new winston.transports.DailyRotateFile({
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            level: 'info'
        }),

        // 3. DAILY ROTATE FILE (Error Logs Only)
        new winston.transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            level: 'error'
        })
    ]
});

export default logger;
