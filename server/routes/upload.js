import express from 'express';
import multer from 'multer';
import { uploadFile } from '../utils/minio.js';
import { authenticateJWT, isPlatformAdmin } from '../middlewares/auth.js';

const router = express.Router();

// C-3 FIX: Allowlist of permitted MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type "${file.mimetype}". Only JPEG, PNG, WEBP, GIF, and PDF are allowed.`));
        }
    }
});

/**
 * Handle Single File Upload
 * POST /api/upload
 * C-2 FIX: Protected — requires Platform Admin auth
 */
router.post('/', authenticateJWT, isPlatformAdmin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file was uploaded." });
        }

        const { originalname, buffer, mimetype } = req.file;
        const publicUrl = await uploadFile(buffer, originalname, mimetype);

        res.status(200).json({ 
            success: true, 
            message: "File uploaded successfully.",
            url: publicUrl 
        });
    } catch (err) {
        console.error("Upload Route Error:", err);
        res.status(err.status || 500).json({ error: err.message || "Internal server storage error." });
    }
});

export default router;
