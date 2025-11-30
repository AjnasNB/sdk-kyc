import { Router } from 'express';
import multer from 'multer';
import * as verifyController from '../controllers/verifyController';

const router = Router();

// Configure multer for file uploads (in-memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

/**
 * POST /api/v1/verify/email
 * Verify email address
 */
router.post('/email', verifyController.verifyEmail);

/**
 * POST /api/v1/verify/phone
 * Verify phone number
 */
router.post('/phone', verifyController.verifyPhone);

/**
 * POST /api/v1/verify/face
 * Upload and verify ID document and Selfie
 */
router.post('/face', upload.fields([
    { name: 'idImage', maxCount: 1 },
    { name: 'selfieImage', maxCount: 1 }
]), verifyController.verifyFace);

export default router;
