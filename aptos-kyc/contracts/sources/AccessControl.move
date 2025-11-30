module kyc::AccessControl {
    use std::signer;
    use std::error;
    use std::string::{String};
    use std::vector;
    use kyc::IdentityRegistry;
    use kyc::ReputationStore;
    use kyc::FraudGuard;
    use kyc::CredentialRegistry;

    // Error codes
    const EACCESS_DENIED: u64 = 1;

    // Check if user meets requirements
    #[view]
    public fun check_access(
        user: address,
        registry_addr: address, // For KYC
        repute_addr: address,   // For Reputation
        fraud_addr: address,    // For FraudGuard
        cred_addr: address,     // For Credentials
        min_kyc_level: u8,
        min_trust_score: u64,
        max_risk_score: u8,
        required_credential: String
    ): bool {
        
        // 1. Check FraudGuard (First priority)
        if (FraudGuard::is_blacklisted(fraud_addr, user)) {
            return false
        };
        let risk = FraudGuard::get_risk_score(fraud_addr, user);
        if (risk > max_risk_score) {
            return false
        };

        // 2. Check KYC
        let kyc_level = IdentityRegistry::get_kyc_level(registry_addr, user);
        if (kyc_level < min_kyc_level) {
            return false
        };

        // 3. Check Reputation
        let trust_score = ReputationStore::get_score(repute_addr, user);
        if (trust_score < min_trust_score) {
            return false
        };

        // 4. Check Credential (if required)
        if (std::string::length(&required_credential) > 0) {
            if (!CredentialRegistry::has_credential(cred_addr, user, required_credential)) {
                return false
            }
        };

        true
    }

    // Assert access (aborts if failed)
    public fun assert_access(
        user: address,
        registry_addr: address,
        repute_addr: address,
        fraud_addr: address,
        cred_addr: address,
        min_kyc_level: u8,
        min_trust_score: u64,
        max_risk_score: u8,
        required_credential: String
    ) {
        assert!(
            check_access(
                user, 
                registry_addr, 
                repute_addr, 
                fraud_addr, 
                cred_addr, 
                min_kyc_level, 
                min_trust_score, 
                max_risk_score, 
                required_credential
            ),
            error::permission_denied(EACCESS_DENIED)
        );
    }
}
