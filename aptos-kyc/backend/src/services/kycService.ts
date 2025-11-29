import crypto from 'crypto';
import { Session, SessionStatus } from '../db/models/Session';
import { Identity } from '../db/models/Identity';
import aptosService from './aptosService';
import emailService from './emailService';
import phoneService from './phoneService';
import zkService from './zkService';

class KycService {
    /**
     * Complete KYC process for a session
     * Validates all verifications, computes credential hash, and submits to blockchain
     */
    async completeKyc(sessionId: string): Promise<{ txHash: string; kycLevel: number }> {
        // Load session
        const session = await Session.findById(sessionId);

        if (!session) {
            throw new Error('Session not found');
        }

        if (session.status === SessionStatus.COMPLETED) {
            throw new Error('KYC already completed for this session');
        }

        // Validate all verifications are complete
        if (!session.emailVerified || !session.phoneVerified || !session.idVerified) {
            throw new Error('Not all verification steps completed');
        }

        if (!session.email || !session.phone || !session.idHash) {
            throw new Error('Missing verification data');
        }

        // Determine KYC level based on completed verifications
        let kycLevel = 0;
        if (session.emailVerified) kycLevel = 1;
        if (session.emailVerified && session.phoneVerified) kycLevel = 2;
        if (session.emailVerified && session.phoneVerified && session.idVerified) kycLevel = 3;

        // Compute credential hash
        const credentialString = `${session.email}:${session.phone}:${session.idHash}`;
        const credentialHash = crypto
            .createHash('sha256')
            .update(credentialString)
            .digest('hex');

        console.log(`[KYC SERVICE] Completing KYC for ${session.walletAddress}, level ${kycLevel}`);

        // Optional: Generate ZK proof for credential
        try {
            // const proof = await zkService.generateProofForCredential(credentialHash);
            // console.log('[KYC SERVICE] ZK proof generated:', proof ? 'success' : 'failed');
        } catch (error) {
            console.warn('[KYC SERVICE] ZK proof generation failed (non-critical):', error);
        }

        // Submit to blockchain
        const txHash = await aptosService.submitKycTx(
            session.walletAddress,
            kycLevel,
            credentialHash
        );

        console.log(`[KYC SERVICE] Blockchain transaction submitted: ${txHash}`);

        // Update session status
        session.status = SessionStatus.COMPLETED;
        await session.save();

        // Create or update identity record
        await Identity.findOneAndUpdate(
            { walletAddress: session.walletAddress },
            {
                walletAddress: session.walletAddress,
                kycLevel,
                credentialHash,
                verified: true,
                lastTxHash: txHash
            },
            { upsert: true, new: true }
        );

        return { txHash, kycLevel };
    }

    /**
     * Get KYC status for a wallet address
     */
    async getStatus(walletAddress: string): Promise<KycStatus> {
        // Try to get from database first
        const dbIdentity = await Identity.findOne({ walletAddress });

        // Also query blockchain for latest state
        const chainIdentity = await aptosService.getIdentityView(walletAddress);

        // Prefer blockchain data if available
        if (chainIdentity) {
            return {
                verified: chainIdentity.verified,
                kycLevel: chainIdentity.kycLevel,
                credentialHash: Array.isArray(chainIdentity.credentialHash)
                    ? Buffer.from(chainIdentity.credentialHash).toString('hex')
                    : chainIdentity.credentialHash,
                lastTxHash: dbIdentity?.lastTxHash || null,
                version: chainIdentity.version
            };
        }

        // Fallback to database
        if (dbIdentity) {
            return {
                verified: dbIdentity.verified,
                kycLevel: dbIdentity.kycLevel,
                credentialHash: dbIdentity.credentialHash,
                lastTxHash: dbIdentity.lastTxHash || null,
                version: 0
            };
        }

        // No KYC found
        return {
            verified: false,
            kycLevel: 0,
            credentialHash: null,
            lastTxHash: null,
            version: 0
        };
    }

    /**
     * Revoke KYC for a wallet address
     */
    async revokeKyc(walletAddress: string): Promise<string> {
        const txHash = await aptosService.revokeKycTx(walletAddress);

        // Update database
        await Identity.findOneAndUpdate(
            { walletAddress },
            {
                verified: false,
                lastTxHash: txHash
            }
        );

        return txHash;
    }
}

export interface KycStatus {
    verified: boolean;
    kycLevel: number;
    credentialHash: string | null;
    lastTxHash: string | null;
    version: number;
}

export default new KycService();
