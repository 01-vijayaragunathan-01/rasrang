import fs from 'fs';
import path from 'path';
import os from 'os';
import { uploadFileFromDisk } from '../utils/minio.js';

export const uploadChunk = async (req, res) => {
    try {
        const { uploadId, chunkIndex, totalChunks, fileName, mimetype } = req.body;
        const chunk = req.file;

        if (!chunk) {
            return res.status(400).json({ error: "Missing chunk data." });
        }

        // Use OS temp dir to prevent cluttering project scope
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, `${uploadId}_${fileName}`);

        // Append this chunk to the temp file
        fs.appendFileSync(tempFilePath, chunk.buffer);

        console.log(`[uploadController] Uploaded chunk ${parseInt(chunkIndex) + 1}/${totalChunks} for ${fileName}`);

        // If this is the final chunk
        if (parseInt(chunkIndex) === parseInt(totalChunks) - 1) {
            console.log(`[uploadController] File complete. Pushing to MinIO...`);
            
            // Upload entire file from local disk to MinIO efficiently
            const publicUrl = await uploadFileFromDisk(tempFilePath, fileName, mimetype);
            
            // Cleanup temp file
            fs.unlinkSync(tempFilePath);
            
            console.log(`[uploadController] Upload verified. URL generated.`);
            return res.status(200).json({ complete: true, url: publicUrl });
        }

        // Not complete yet
        return res.status(200).json({ complete: false });

    } catch (error) {
        console.error("[uploadController] Error processing chunk:", error);
        return res.status(500).json({ error: "Chunk processing collapsed." });
    }
};
