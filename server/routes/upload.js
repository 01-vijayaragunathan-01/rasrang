import express from 'express';
import multer from 'multer';
import { uploadFile } from '../utils/minio.js';

const router = express.Router();

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * Handle Single File Upload
 * POST /api/upload
 */
router.post('/', upload.single('file'), async (req, res) => {
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
        res.status(500).json({ error: "Internal server storage error." });
    }
});

export default router;
