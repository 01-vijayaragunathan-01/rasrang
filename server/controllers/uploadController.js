import fs from 'fs';
import path from 'path';
import os from 'os';
import { uploadFileFromDisk } from '../utils/minio.js';
import logger from '../utils/logger.js';

export const uploadChunk = async (req, res) => {
    try {
        const { uploadId, chunkIndex, totalChunks, fileName, mimetype } = req.body;
        const chunk = req.file;

        if (!chunk) {
            logger.warn(`Chunk upload: Missing data for ${fileName}`, { requestId: req.requestId });
            return res.status(400).json({ error: "Missing chunk data." });
        }

        // Use OS temp dir to prevent cluttering project scope
        const tempDir = os.tmpdir();
        // C-4 FIX: path.basename() strips all directory separators to prevent path traversal
        const safeFileName = path.basename(fileName);
        const tempFilePath = path.join(tempDir, `${uploadId}_${safeFileName}`);

        // Append this chunk to the temp file
        fs.appendFileSync(tempFilePath, chunk.buffer);

        logger.info(`Chunk ${parseInt(chunkIndex) + 1}/${totalChunks} received for ${fileName}`, { requestId: req.requestId });

        // If this is the final chunk
        if (parseInt(chunkIndex) === parseInt(totalChunks) - 1) {
            logger.info(`Final chunk received for ${fileName}. Finalizing upload...`, { requestId: req.requestId });
            
            // Upload entire file from local disk to MinIO efficiently
            const publicUrl = await uploadFileFromDisk(tempFilePath, fileName, mimetype);
            
            // Cleanup temp file
            fs.unlinkSync(tempFilePath);
            
            logger.info(`Upload COMPLETE: Visual archive update verified`, { url: publicUrl, requestId: req.requestId });
            return res.status(200).json({ complete: true, url: publicUrl });
        }

        // Not complete yet
        return res.status(200).json({ complete: false });

    } catch (error) {
        logger.error(`Chunked upload failure`, { error: error.message, requestId: req.requestId });
        return res.status(500).json({ error: "Chunk processing collapsed." });
    }
};
