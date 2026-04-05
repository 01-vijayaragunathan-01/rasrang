import * as Minio from 'minio';
import dotenv from 'dotenv';
dotenv.config();

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'your_access_key',
    secretKey: process.env.MINIO_SECRET_KEY || 'your_secret_key',
});

const bucketName = process.env.MINIO_BUCKET || 'rasrang-assets';

// Ensure bucket exists on start
export const initMinio = async () => {
    try {
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`Successfully created MinIO bucket: ${bucketName}`);
            
            // Set public read policy for the bucket
            const policy = {
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: { AWS: ["*"] },
                        Action: ["s3:GetBucketLocation", "s3:ListBucket"],
                        Resource: [`arn:aws:s3:::${bucketName}`]
                    },
                    {
                        Effect: "Allow",
                        Principal: { AWS: ["*"] },
                        Action: ["s3:GetObject"],
                        Resource: [`arn:aws:s3:::${bucketName}/*`]
                    }
                ]
            };
            await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
            console.log(`Public policy applied to bucket: ${bucketName}`);
        } else {
            console.log(`MinIO bucket "${bucketName}" already exists.`);
        }
    } catch (err) {
        console.error("Error initializing MinIO:", err.message);
    }
};

/**
 * Upload a file to MinIO
 * @param {Buffer} fileBuffer 
 * @param {string} fileName 
 * @param {string} mimetype 
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export const uploadFile = async (fileBuffer, fileName, mimetype) => {
    try {
        const metaData = { 'Content-Type': mimetype };
        const objectName = `${Date.now()}-${fileName}`;
        
        await minioClient.putObject(bucketName, objectName, fileBuffer, fileBuffer.length, metaData);
        
        // Construct the public URL
        const publicBase = process.env.MINIO_PUBLIC_URL;
        const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
        const url = publicBase 
            ? `${publicBase}/${bucketName}/${objectName}`
            : `${protocol}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${objectName}`;
        
        return url;
    } catch (err) {
        console.error("MinIO Upload Error:", err);
        // M-3 FIX: Throw instead of silently returning undefined, to prevent null imageUrls in DB
        throw new Error(`Storage upload failed: ${err.message}`);
    }
};

/**
 * Upload a file to MinIO direct from a local disk path (RAM efficient)
 * @param {string} filePath 
 * @param {string} fileName 
 * @param {string} mimetype 
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export const uploadFileFromDisk = async (filePath, fileName, mimetype) => {
    try {
        const metaData = { 'Content-Type': mimetype };
        const objectName = `${Date.now()}-${fileName}`;
        
        await minioClient.fPutObject(bucketName, objectName, filePath, metaData);
        
        // Construct the public URL
        const publicBase = process.env.MINIO_PUBLIC_URL;
        const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
        const url = publicBase 
            ? `${publicBase}/${bucketName}/${objectName}`
            : `${protocol}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${objectName}`;
        
        return url;
    } catch (err) {
        console.error("MinIO fPutObject Error:", err);
        throw new Error("Failed to upload local file to storage.");
    }
};

export const deleteFile = async (imageUrl) => {
    try {
        if (!imageUrl) return;
        
        // Extract the object name from the URL
        // Example URL: http://localhost:9000/rasrang-assets/123456789-image.png
        const urlParts = imageUrl.split('/');
        const objectName = urlParts[urlParts.length - 1];
        
        await minioClient.removeObject(bucketName, objectName);
        console.log(`Successfully purged object from MinIO: ${objectName}`);
    } catch (err) {
        console.error("MinIO Deletion Error:", err);
        // We don't throw here to avoid blocking the DB delete if storage delete fails
    }
};

export default minioClient;
