import path from 'path';
import fs from 'fs';
const snarkjs = require('snarkjs');

export interface ZKProof {
    proof: any;
    publicSignals: string[];
}

/**
 * Generate ZK proof for credential verification
 * Uses Circom circuit compiled with snarkjs
 */
export async function generateProof(secret: bigint): Promise<ZKProof | null> {
    try {
        const zkDir = path.resolve(process.cwd(), 'backend/src/zk');
        const wasmPath = path.join(zkDir, 'circuit.wasm');
        const zkeyPath = path.join(zkDir, 'circuit_final.zkey');

        // Check if circuit files exist
        if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
            console.warn('[ZK] Circuit files not found. Run npm run zk:setup first.');
            console.warn('[ZK] Returning mock proof for development...');

            // Return mock proof for development
            return {
                proof: {
                    pi_a: ["0", "0", "1"],
                    pi_b: [["0", "0"], ["0", "0"], ["1", "0"]],
                    pi_c: ["0", "0", "1"],
                    protocol: "groth16",
                    curve: "bn128"
                },
                publicSignals: [secret.toString()]
            };
        }

        // Compute expected hash using Poseidon (simplified for JS)
        // In a real implementation, use the same Poseidon hash as the circuit
        const hash = computePoseidonHash(secret);

        // Prepare input for circuit
        const input = {
            secret: secret.toString(),
            hash: hash.toString()
        };

        console.log('[ZK] Generating witness...');
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input,
            wasmPath,
            zkeyPath
        );

        console.log('[ZK] Proof generated successfully');

        return {
            proof,
            publicSignals
        };
    } catch (error) {
        console.error('[ZK] Error generating proof:', error);
        return null;
    }
}

/**
 * Verify a ZK proof
 */
export async function verifyProof(proof: any, publicSignals: string[]): Promise<boolean> {
    try {
        const zkDir = path.resolve(process.cwd(), 'backend/src/zk');
        const vkeyPath = path.join(zkDir, 'verification_key.json');

        if (!fs.existsSync(vkeyPath)) {
            console.warn('[ZK] Verification key not found. Skipping verification...');
            return true; // For development, accept all proofs
        }

        const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'));

        const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);

        console.log('[ZK] Proof verification:', res ? 'VALID' : 'INVALID');
        return res;
    } catch (error) {
        console.error('[ZK] Error verifying proof:', error);
        return false;
    }
}

/**
 * Simplified Poseidon hash for demonstration
 * In production, use actual Poseidon implementation matching the circuit
 * For now, use a placeholder
 */
function computePoseidonHash(input: bigint): bigint {
    // This is a placeholder - in production, use:
    // import { poseidon } from 'circomlibjs';
    // return poseidon([input]);

    // For now, return the input as-is (mock)
    return input;
}

/**
 * Convert credential hash (hex string) to bigint for ZK circuit
 */
export function credentialHashToBigInt(hash: string): bigint {
    // Take first 31 bytes to fit in BN128 field
    const truncated = hash.substring(0, 62); // 31 bytes = 62 hex chars
    return BigInt('0x' + truncated);
}
