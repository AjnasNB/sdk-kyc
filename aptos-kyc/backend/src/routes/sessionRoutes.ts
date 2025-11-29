import { Router } from 'express';
import * as sessionController from '../controllers/sessionController';

const router = Router();

/**
 * POST /api/v1/session/start
 * Create a new KYC session
 */
router.post('/start', sessionController.startSession);

/**
 * GET /api/v1/session/:sessionId
 * Get session details
 */
router.get('/:sessionId', sessionController.getSession);

export default router;
