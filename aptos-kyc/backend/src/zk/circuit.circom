pragma circom 2.1.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

/**
 * Simple credential verification circuit
 * Verifies that the prover knows a secret whose Poseidon hash matches a public hash
 * 
 * This is a simplified ZK proof for MVP.
 * In production, you might want more complex circuits for:
 * - Selective disclosure (prove age > 18 without revealing exact age)
 * - Attribute verification without revealing raw data
 * - Multi-credential proofs
 */
template CredentialVerifier() {
    // Private input: the secret credential
    signal input secret;
    
    // Public input: the expected hash
    signal input hash;
    
    // Compute Poseidon hash of secret
    component poseidon = Poseidon(1);
    poseidon.inputs[0] <== secret;
    
    // Constraint: computed hash must equal public hash
    poseidon.out === hash;
}

component main {public [hash]} = CredentialVerifier();
