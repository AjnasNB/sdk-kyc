import { Router } from 'express';
import * as statusController from '../controllers/statusController';

const router = Router();

/**
 * GET /api/v1/status/:wallet
 * Get KYC status for a wallet address
 */
router.get('/:wallet', statusController.getStatus);

export default router;
