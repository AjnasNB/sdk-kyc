module kyc::ReputationStore {
    use std::signer;
    use std::error;
    use std::string::{String};
    use std::vector;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use kyc::KYCConfig;

    // Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const EPROFILE_NOT_FOUND: u64 = 2;

    // Reputation Profile
    struct ReputationProfile has store, drop, copy {
        wallet: address,
        score: u64,          // 0 - 1000
        level: u8,           // Derived from score (e.g., 0-5)
        badges: vector<String>,
        last_update: u64,
    }

    // Events
    struct ScoreUpdatedEvent has store, drop {
        wallet: address,
        new_score: u64,
        timestamp: u64,
    }

    struct BadgeIssuedEvent has store, drop {
        wallet: address,
        badge: String,
        timestamp: u64,
    }

    // Global Store
    struct Store has key {
        profiles: vector<ReputationProfile>,
        score_events: EventHandle<ScoreUpdatedEvent>,
        badge_events: EventHandle<BadgeIssuedEvent>,
        config_address: address,
    }

    // Initialize
    public entry fun init_reputation(owner: &signer, config_address: address) {
        let owner_addr = signer::address_of(owner);
        if (!exists<Store>(owner_addr)) {
            move_to(owner, Store {
                profiles: vector::empty(),
                score_events: account::new_event_handle<ScoreUpdatedEvent>(owner),
                badge_events: account::new_event_handle<BadgeIssuedEvent>(owner),
                config_address,
            });
        }
    }

    // Update Trust Score
    public entry fun update_score(
        issuer: &signer,
        store_addr: address,
        user: address,
        new_score: u64
    ) acquires Store {
        let store = borrow_global_mut<Store>(store_addr);
        
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
                profile.score = new_score;
                profile.last_update = timestamp::now_seconds();
                found = true;
                break
            };
            i = i + 1;
        };

        if (!found) {
            let profile = ReputationProfile {
                wallet: user,
                score: new_score,
                level: 0, // Logic to calculate level can be added
                badges: vector::empty(),
                last_update: timestamp::now_seconds(),
            };
            vector::push_back(&mut store.profiles, profile);
        };

        event::emit_event(&mut store.score_events, ScoreUpdatedEvent {
            wallet: user,
            new_score,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Issue Badge
    public entry fun issue_badge(
        issuer: &signer,
        store_addr: address,
        user: address,
        badge_name: String
    ) acquires Store {
        let store = borrow_global_mut<Store>(store_addr);
        
        // Check authorization
        let issuer_addr = signer::address_of(issuer);
        let trusted_issuer = KYCConfig::get_trusted_issuer(store.config_address);
        assert!(issuer_addr == trusted_issuer, error::permission_denied(ENOT_AUTHORIZED));

        // Find profile
        let len = vector::length(&store.profiles);
        let i = 0;
        
        while (i < len) {
            let profile = vector::borrow_mut(&mut store.profiles, i);
            if (profile.wallet == user) {
                if (!vector::contains(&profile.badges, &badge_name)) {
                    vector::push_back(&mut profile.badges, badge_name);
                    
                    event::emit_event(&mut store.badge_events, BadgeIssuedEvent {
                        wallet: user,
                        badge: badge_name,
                        timestamp: timestamp::now_seconds(),
                    });
                };
                return
            };
            i = i + 1;
        };
        // If profile doesn't exist, create it first (implicit logic or error)
        // For simplicity, we assume profile exists or we create it
    }

    #[view]
    public fun get_score(store_addr: address, user: address): u64 acquires Store {
        if (!exists<Store>(store_addr)) {
            return 0
        };
        
        let store = borrow_global<Store>(store_addr);
        let len = vector::length(&store.profiles);
        let i = 0;
        
        while (i < len) {
            let profile = vector::borrow(&store.profiles, i);
            if (profile.wallet == user) {
                return profile.score
            };
            i = i + 1;
        };
        0
    }

    #[view]
    public fun get_badges(store_addr: address, user: address): vector<String> acquires Store {
        if (!exists<Store>(store_addr)) {
            return vector::empty()
        };
        
        let store = borrow_global<Store>(store_addr);
        let len = vector::length(&store.profiles);
        let i = 0;
        
        while (i < len) {
            let profile = vector::borrow(&store.profiles, i);
            if (profile.wallet == user) {
                return profile.badges
            };
            i = i + 1;
        };
        vector::empty()
    }
}
