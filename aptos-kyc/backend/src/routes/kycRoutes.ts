import { Router } from 'express';
import * as kycController from '../controllers/kycController';

const router = Router();

/**
 * POST /api/v1/kyc/complete
 * Complete KYC process and submit to blockchain
 */
router.post('/complete', kycController.completeKyc);

/**
 * POST /api/v1/kyc/mint-nft
 * Mint identity NFT for verified user
 */
router.post('/mint-nft', kycController.mintNft);

export default router;
