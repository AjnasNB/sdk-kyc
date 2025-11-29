import { generateProof, verifyProof, credentialHashToBigInt, ZKProof } from '../zk/generateProof';

class ZkService {
    /**
     * Generate ZK proof for credential hash
     * Proves knowledge of credential without revealing it
     */
    async generateProofForCredential(credentialHash: string): Promise<ZKProof | null> {
        try {
            // Convert hex hash to bigint for circuit
            const secret = credentialHashToBigInt(credentialHash);

            console.log('[ZK SERVICE] Generating proof for credential...');
            const proof = await generateProof(secret);

            if (proof) {
                console.log('[ZK SERVICE] Proof generated successfully');
            } else {
                console.warn('[ZK SERVICE] Proof generation failed');
            }

            return proof;
        } catch (error) {
            console.error('[ZK SERVICE] Error in proof generation:', error);
            return null;
        }
    }

    /**
     * Verify a ZK proof
     */
    async verifyCredentialProof(proof: any, publicSignals: string[]): Promise<boolean> {
        try {
            console.log('[ZK SERVICE] Verifying proof...');
            const isValid = await verifyProof(proof, publicSignals);

            console.log('[ZK SERVICE] Proof valid:', isValid);
            return isValid;
        } catch (error) {
            console.error('[ZK SERVICE] Error in proof verification:', error);
            return false;
        }
    }
}

export default new ZkService();
