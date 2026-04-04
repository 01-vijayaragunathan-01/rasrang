import { PrismaClient } from '@prisma/client';
import { uploadFile, deleteFile } from '../utils/minio.js';

const prisma = new PrismaClient();

// ==========================================
// 1. GET ALL GALLERY ITEMS (Public)
// ==========================================
export const getGallery = async (req, res) => {
    console.log(`[galleryController] getGallery → request received`);
    try {
        const items = await prisma.gallery.findMany({
            orderBy: { createdAt: 'desc' }
        });
        console.log(`[galleryController] getGallery → success: returned ${items.length} items`);
        res.status(200).json(items);
    } catch (err) {
        console.error("[galleryController] getGallery → ERROR:", err);
        res.status(500).json({ error: 'Failed to retrieve visual archives' });
    }
};

// ==========================================
// 2. ADD GALLERY ITEM (Admin Only)
// ==========================================
export const createGalleryItem = async (req, res) => {
    const { caption, category } = req.body;
    console.log(`[galleryController] createGalleryItem → called by user: ${req.user?.id}`);
    console.log(`[galleryController] createGalleryItem → payload:`, { caption, category, hasFile: !!req.file });
    try {
        if (!req.file) {
            console.log(`[galleryController] createGalleryItem → validation failed: no image file provided`);
            return res.status(400).json({ error: "Missing image file" });
        }

        console.log(`[galleryController] createGalleryItem → uploading image: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);
        const imageUrl = await uploadFile(
            req.file.buffer, 
            req.file.originalname, 
            req.file.mimetype
        );
        console.log(`[galleryController] createGalleryItem → image uploaded to: ${imageUrl}`);

        const newItem = await prisma.gallery.create({
            data: {
                imageUrl,
                caption: caption || '',
                category: category || 'General'
            }
        });

        console.log(`[galleryController] createGalleryItem → success: created gallery item with id: ${newItem.id}`);
        res.status(201).json({ message: "Gallery item added successfully", item: newItem });
    } catch (err) {
        console.error("[galleryController] createGalleryItem → ERROR:", err);
        res.status(500).json({ error: 'Failed to upload photo to archives' });
    }
};

// ==========================================
// 3. DELETE GALLERY ITEM (Admin Only)
// ==========================================
export const deleteGalleryItem = async (req, res) => {
    const { id } = req.params;
    console.log(`[galleryController] deleteGalleryItem → called by user: ${req.user?.id} for item id: ${id}`);
    try {
        const item = await prisma.gallery.findUnique({ where: { id } });
        if (!item) {
            console.log(`[galleryController] deleteGalleryItem → NOT FOUND: item id ${id}`);
            return res.status(404).json({ error: "Item not found" });
        }

        console.log(`[galleryController] deleteGalleryItem → found item (caption: "${item.caption}"), proceeding with deletion...`);

        await prisma.gallery.delete({
            where: { id }
        });

        console.log(`[galleryController] deleteGalleryItem → DB record deleted for item ${id}`);

        // Background cleanup 
        if (item.imageUrl) {
            console.log(`[galleryController] deleteGalleryItem → triggering MinIO cleanup for: ${item.imageUrl}`);
            deleteFile(item.imageUrl);
        }

        console.log(`[galleryController] deleteGalleryItem → success: item ${id} fully purged`);
        res.status(200).json({ message: "Item successfully purged from archives" });
    } catch (err) {
        console.error(`[galleryController] deleteGalleryItem → ERROR for id ${id}:`, err);
        res.status(500).json({ error: 'Failed to delete gallery item' });
    }
};
