import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import kycService from '../services/kycService';
import aptosService from '../services/aptosService';

const completeKycSchema = Joi.object({
    sessionId: Joi.string().required()
});

export async function completeKyc(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
        const { error, value } = completeKycSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }

        const { sessionId } = value;

        console.log(`[KYC] Completing KYC for session ${sessionId}`);

        // Complete KYC process
        const result = await kycService.completeKyc(sessionId);

        res.json({
            success: true,
            message: 'KYC completed successfully',
            data: {
                txHash: result.txHash,
                kycLevel: result.kycLevel,
                explorerUrl: `https://explorer.aptoslabs.com/txn/${result.txHash}?network=testnet`
            }
        });
    } catch (err: any) {
        console.error('[KYC] Error completing KYC:', err);

        if (err.message && (err.message.includes('not found') || err.message.includes('Missing'))) {
            return res.status(404).json({
                success: false,
                error: err.message
            });
        }

        if (err.message && (err.message.includes('already completed') || err.message.includes('Not all'))) {
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }

        next(err);
    }
}

export async function mintNft(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
        const walletSchema = Joi.object({
            walletAddress: Joi.string().required().regex(/^0x[a-fA-F0-9]{64}$/)
        });

        const { error, value } = walletSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.details[0].message
            });
        }

        const { walletAddress } = value;

        // Check if user is verified
        const isVerified = await aptosService.isVerified(walletAddress);
        if (!isVerified) {
            return res.status(403).json({
                success: false,
                error: 'User must complete KYC verification before minting NFT'
            });
        }

        console.log(`[KYC] Minting NFT for ${walletAddress}`);

        // Mint NFT
        const txHash = await aptosService.mintIdentityNft(walletAddress);

        res.json({
            success: true,
            message: 'Identity NFT minted successfully',
            data: {
                txHash,
                explorerUrl: `https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`
            }
        });
    } catch (err: any) {
        console.error('[KYC] Error minting NFT:', err);

        if (err.message && err.message.includes('already')) {
            return res.status(400).json({
                success: false,
                error: 'NFT already minted for this address'
            });
        }

        next(err);
    }
}
