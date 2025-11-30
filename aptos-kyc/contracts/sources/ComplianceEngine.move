module kyc::ComplianceEngine {
    use std::signer;
    use std::error;
    use std::string::{String};
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use kyc::AccessControl;
    use kyc::KYCConfig;

    // Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const ERULE_VIOLATION: u64 = 2;

    // Rule Definition
    struct Rule has store, drop, copy {
        name: String,
        min_kyc_level: u8,
        min_trust_score: u64,
        max_risk_score: u8,
        required_credential: String,
        active: bool,
    }

    // Rule Store
    struct RuleStore has key {
        rules: vector<Rule>,
        config_address: address,
    }

    // Initialize
    public entry fun init_compliance(owner: &signer, config_address: address) {
        let owner_addr = signer::address_of(owner);
        if (!exists<RuleStore>(owner_addr)) {
            move_to(owner, RuleStore {
                rules: vector::empty(),
                config_address,
            });
        }
    }

    // Add or Update Rule
    public entry fun add_rule(
        issuer: &signer,
        store_addr: address,
        name: String,
        min_kyc_level: u8,
        min_trust_score: u64,
        max_risk_score: u8,
        required_credential: String
    ) acquires RuleStore {
        let store = borrow_global_mut<RuleStore>(store_addr);
        
        // Check authorization
        let issuer_addr = signer::address_of(issuer);
        let trusted_issuer = KYCConfig::get_trusted_issuer(store.config_address);
        assert!(issuer_addr == trusted_issuer, error::permission_denied(ENOT_AUTHORIZED));

        // Create rule
        let rule = Rule {
            name,
            min_kyc_level,
            min_trust_score,
            max_risk_score,
            required_credential,
            active: true,
        };

        // Update if exists, else add
        let len = vector::length(&store.rules);
        let i = 0;
        let found = false;
        while (i < len) {
            let r = vector::borrow_mut(&mut store.rules, i);
            if (r.name == name) {
                *r = rule;
                found = true;
                break
            };
            i = i + 1;
        };

        if (!found) {
            vector::push_back(&mut store.rules, rule);
        };
    }

    // Check Compliance for a specific rule
    #[view]
    public fun check_compliance(
        user: address,
        store_addr: address,
        registry_addr: address,
        repute_addr: address,
        fraud_addr: address,
        cred_addr: address,
        rule_name: String
    ): bool acquires RuleStore {
        if (!exists<RuleStore>(store_addr)) {
            return false
        };

        let store = borrow_global<RuleStore>(store_addr);
        let len = vector::length(&store.rules);
        let i = 0;
        
        while (i < len) {
            let rule = vector::borrow(&store.rules, i);
            if (rule.name == rule_name && rule.active) {
                return AccessControl::check_access(
                    user,
                    registry_addr,
                    repute_addr,
                    fraud_addr,
                    cred_addr,
                    rule.min_kyc_level,
                    rule.min_trust_score,
                    rule.max_risk_score,
                    rule.required_credential
                )
            };
            i = i + 1;
        };
        
        // If rule not found, default to allow or deny? 
        // For safety, if rule is checked but not found, we deny.
        false
    }
}
