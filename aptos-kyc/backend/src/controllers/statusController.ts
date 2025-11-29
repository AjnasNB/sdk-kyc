import { Request, Response, NextFunction } from 'express';
import kycService from '../services/kycService';

export async function getStatus(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
        const { wallet } = req.params;

        // Validate wallet address format
        if (!wallet || !/^0x[a-fA-F0-9]{64}$/.test(wallet)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid wallet address format'
            });
        }

        console.log(`[STATUS] Checking status for ${wallet}`);

        // Get KYC status
        const status = await kycService.getStatus(wallet);

        res.json({
            success: true,
            data: {
                walletAddress: wallet,
                verified: status.verified,
                kycLevel: status.kycLevel,
                credentialHash: status.credentialHash,
                lastTxHash: status.lastTxHash,
                version: status.version
            }
        });
    } catch (err) {
        next(err);
    }
}
