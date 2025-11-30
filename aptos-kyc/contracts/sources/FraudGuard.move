module kyc::FraudGuard {
    use std::signer;
    use std::error;
    use std::vector;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use kyc::KYCConfig;

    // Error codes
    const ENOT_AUTHORIZED: u64 = 1;

    // Risk Profile
    struct RiskProfile has store, drop, copy {
        wallet: address,
        risk_score: u8,      // 0-100 (Higher is riskier)
        is_blacklisted: bool,
        flags: vector<u64>,  // Bitmask or list of flag IDs
        last_update: u64,
    }

    // Events
    struct RiskUpdatedEvent has store, drop {
        wallet: address,
        new_score: u8,
        is_blacklisted: bool,
        timestamp: u64,
    }

    // Global Store
    struct GuardStore has key {
        profiles: vector<RiskProfile>,
        events: EventHandle<RiskUpdatedEvent>,
        config_address: address,
    }

    // Initialize
    public entry fun init_fraud_guard(owner: &signer, config_address: address) {
        let owner_addr = signer::address_of(owner);
        if (!exists<GuardStore>(owner_addr)) {
            move_to(owner, GuardStore {
                profiles: vector::empty(),
                events: account::new_event_handle<RiskUpdatedEvent>(owner),
                config_address,
            });
        }
    }

    // Update Risk Score
    public entry fun update_risk(
        issuer: &signer,
        store_addr: address,
        user: address,
        risk_score: u8,
        is_blacklisted: bool
    ) acquires GuardStore {
        let store = borrow_global_mut<GuardStore>(store_addr);
        
        // Check authorization
        let issuer_addr = signer::address_of(issuer);
        let trusted_issuer = KYCConfig::get_trusted_issuer(store.config_address);
        assert!(issuer_addr == trusted_issuer, error::permission_denied(ENOT_AUTHORIZED));

        // Find or create profile
        let len = vector::length(&store.profiles);
        let i = 0;
        let found = false;
        
        while (i < len) {
            let profile = vector::borrow_mut(&mut store.profiles, i);
            if (profile.wallet == user) {
                profile.risk_score = risk_score;
                profile.is_blacklisted = is_blacklisted;
                profile.last_update = timestamp::now_seconds();
                found = true;
                break
            };
            i = i + 1;
        };

        if (!found) {
            let profile = RiskProfile {
                wallet: user,
                risk_score,
                is_blacklisted,
                flags: vector::empty(),
                last_update: timestamp::now_seconds(),
            };
            vector::push_back(&mut store.profiles, profile);
        };

        event::emit_event(&mut store.events, RiskUpdatedEvent {
            wallet: user,
            new_score: risk_score,
            is_blacklisted,
            timestamp: timestamp::now_seconds(),
        });
    }

    #[view]
    public fun get_risk_score(store_addr: address, user: address): u8 acquires GuardStore {
        if (!exists<GuardStore>(store_addr)) {
            return 0 // Default low risk
        };
        
        let store = borrow_global<GuardStore>(store_addr);
        let len = vector::length(&store.profiles);
        let i = 0;
        
        while (i < len) {
            let profile = vector::borrow(&store.profiles, i);
            if (profile.wallet == user) {
                return profile.risk_score
            };
            i = i + 1;
        };
        0
    }

    #[view]
    public fun is_blacklisted(store_addr: address, user: address): bool acquires GuardStore {
        if (!exists<GuardStore>(store_addr)) {
            return false
        };
        
        let store = borrow_global<GuardStore>(store_addr);
        let len = vector::length(&store.profiles);
        let i = 0;
        
        while (i < len) {
            let profile = vector::borrow(&store.profiles, i);
            if (profile.wallet == user) {
                return profile.is_blacklisted
            };
            i = i + 1;
        };
        false
    }
}
