import { PrismaClient } from '@prisma/client';
import { uploadFile, deleteFile } from '../utils/minio.js';
import logger from '../utils/logger.js';
import prisma from '../db.js'; // H-1 FIX: Shared Prisma singleton

// ==========================================
// 1. GET ALL GALLERY ITEMS (Public)
// ==========================================
export const getGallery = async (req, res) => {
    try {
        const items = await prisma.gallery.findMany({
            orderBy: { createdAt: 'desc' }
        });
        logger.info(`Fetched gallery archives: ${items.length} items returned`, { requestId: req.requestId });
        res.status(200).json(items);
    } catch (err) {
        logger.error(`Failed to retrieve gallery archives`, { error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to retrieve visual archives' });
    }
};

// ==========================================
// 2. ADD GALLERY ITEM (Admin Only)
// ==========================================
export const createGalleryItem = async (req, res) => {
    const { caption, category, imageUrl: bodyImageUrl } = req.body;
    logger.info(`Admin: Adding gallery item`, { caption, category, requestId: req.requestId });
    try {
        let imageUrl = bodyImageUrl;

        // If a file was uploaded directly (fallback for non-chunked clients)
        if (!imageUrl && req.file) {
            logger.info(`Gallery: Pushing direct asset to MinIO`, { fileName: req.file.originalname, requestId: req.requestId });
            imageUrl = await uploadFile(
                req.file.buffer, 
                req.file.originalname, 
                req.file.mimetype
            );
        }

        if (!imageUrl) {
            logger.warn(`Gallery upload failed: No asset provided (file or URL)`, { requestId: req.requestId });
            return res.status(400).json({ error: "Missing image asset" });
        }

        logger.info(`Gallery: Asset verified at ${imageUrl}`, { requestId: req.requestId });

        const newItem = await prisma.gallery.create({
            data: {
                imageUrl,
                caption: caption || '',
                category: category || 'General'
            }
        });

        logger.info(`Gallery archive SUCCESS: Created item ${newItem.id}`, { requestId: req.requestId });
        res.status(201).json({ message: "Gallery item added successfully", item: newItem });
    } catch (err) {
        logger.error(`Gallery archive failure`, { error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to upload photo to archives' });
    }
};

// ==========================================
// 3. DELETE GALLERY ITEM (Admin Only)
// ==========================================
export const deleteGalleryItem = async (req, res) => {
    const { id } = req.params;
    logger.warn(`Admin: DELETE gallery item requested`, { id, requestId: req.requestId });
    try {
        const item = await prisma.gallery.findUnique({ where: { id } });
        if (!item) {
            logger.warn(`Delete failed: Item ${id} not found in archives`, { requestId: req.requestId });
            return res.status(404).json({ error: "Item not found" });
        }

        console.log(`[galleryController] deleteGalleryItem → found item (caption: "${item.caption}"), proceeding with deletion...`);

        await prisma.gallery.delete({
            where: { id }
        });

        logger.info(`Gallery DB record purged for item ${id}`, { requestId: req.requestId });

        // Background cleanup 
        if (item.imageUrl) {
            logger.info(`Triggered MinIO asset cleanup for purged gallery item`, { url: item.imageUrl, requestId: req.requestId });
            deleteFile(item.imageUrl);
        }

        logger.info(`Gallery item ${id} fully terminated from system`, { requestId: req.requestId });
        res.status(200).json({ message: "Item successfully purged from archives" });
    } catch (err) {
        logger.error(`Gallery item deletion CRITICAL failure`, { id, error: err.message, requestId: req.requestId });
        res.status(500).json({ error: 'Failed to delete gallery item' });
    }
};
