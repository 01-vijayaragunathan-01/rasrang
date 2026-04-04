import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

const requestLogger = (req, res, next) => {
    // 1. Generate a unique ID for this request to track it across all logs
    const requestId = uuidv4();
    const startTime = Date.now();

    // 2. Attach ID to the request for trace-ability in controllers
    req.requestId = requestId;

    // 3. LISTEN FOR RESPONSE COMPLETION
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        const { method, originalUrl, ip } = req;
        const { statusCode } = res;
        const userAgent = req.get('user-agent') || 'unknown';
        const userId = req.user?.id || 'anonymous';

        // 4. PREPARE LOG DATA
        const logData = {
            requestId,
            method,
            url: originalUrl,
            statusCode,
            responseTime,
            ip,
            userAgent,
            userId,
            query: req.query,
            // Skip logging full body if it might contain private data - 
            // but we'll log keys for debugging
            bodyKeys: Object.keys(req.body || {})
        };

        // 5. DISPATCH LOG (ASYNC)
        if (statusCode >= 400) {
            logger.error(`[REQUEST] ${method} ${originalUrl} failed with status ${statusCode}`, logData);
        } else {
            logger.info(`[REQUEST] ${method} ${originalUrl} success`, logData);
        }
    });

    next();
};

export default requestLogger;
