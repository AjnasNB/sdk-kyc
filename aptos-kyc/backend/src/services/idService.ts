import crypto from 'crypto';

class IdService {
    /**
     * Process ID document upload
     * Computes hash of the document and optionally stores encrypted version
     * 
     * @param buffer - File buffer from multer
     * @returns Hash of the document
     */
    async processIdDocument(buffer: Buffer): Promise<string> {
        // Compute SHA-256 hash of the document
        const hash = crypto.createHash('sha256').update(buffer).digest('hex');

        // TODO: In production, consider:
        // 1. Storing encrypted document in secure storage (S3 with KMS)
        // 2. Running OCR/document verification
        // 3. Extracting metadata
        // 4. Checking against fraud databases

        console.log(`[ID SERVICE] Processed document, hash: ${hash.substring(0, 16)}...`);

        return hash;
    }

    /**
     * Validate image file
     */
    validateImageFile(mimetype: string, size: number): { valid: boolean; error?: string } {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(mimetype)) {
            return {
                valid: false,
                error: 'Invalid file type. Allowed: JPEG, PNG, WebP'
            };
        }

        if (size > maxSize) {
            return {
                valid: false,
                error: 'File too large. Maximum size: 10MB'
            };
        }

        return { valid: true };
    }

    /**
     * Encrypt document for storage (optional, for production)
     */
    encryptDocument(buffer: Buffer, key: string): Buffer {
        const algorithm = 'aes-256-cbc';
        const keyBuffer = crypto.scryptSync(key, 'salt', 32);
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
        const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

        // Prepend IV to encrypted data
        return Buffer.concat([iv, encrypted]);
    }

    /**
     * Decrypt document (optional, for production)
     */
    decryptDocument(encrypted: Buffer, key: string): Buffer {
        const algorithm = 'aes-256-cbc';
        const keyBuffer = crypto.scryptSync(key, 'salt', 32);

        // Extract IV from beginning
        const iv = encrypted.slice(0, 16);
        const encryptedData = encrypted.slice(16);

        const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
        return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    }
}

export default new IdService();
