module kyc::IdentityRegistry {
    use std::signer;
    use std::error;
    use std::option::{Self, Option};
    use aptos_std::table::{Self, Table};
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use kyc::KYCConfig;

    // Error codes
    const EALREADY_INITIALIZED: u64 = 1;
    const ENOT_AUTHORIZED: u64 = 2;
    const ENOT_INITIALIZED: u64 = 3;
    const EIDENTITY_NOT_FOUND: u64 = 4;
    const EINVALID_KYC_LEVEL: u64 = 5;

    // KYC levels
    const KYC_LEVEL_NONE: u8 = 0;
    const KYC_LEVEL_EMAIL: u8 = 1;
    const KYC_LEVEL_EMAIL_PHONE: u8 = 2;
    const KYC_LEVEL_FULL: u8 = 3;

    // Identity data structure
    struct Identity has store, drop, copy {
        wallet: address,
        kyc_level: u8,
        credential_hash: vector<u8>,
        verified: bool,
        version: u64,
    }

    // Event emitted when identity is created or updated
    struct IdentityEvent has store, drop {
        wallet: address,
        kyc_level: u8,
        verified: bool,
        timestamp: u64,
    }

    // Global registry storing all identities
    struct IdentityStore has key {
        identities: Table<address, Identity>,
        identity_events: EventHandle<IdentityEvent>,
        config_address: address,
    }

    // Initialize the identity registry
    // Should be called once by the module deployer
    public entry fun init(owner: &signer, config_address: address) {
        let owner_addr = signer::address_of(owner);
        assert!(!exists<IdentityStore>(owner_addr), error::already_exists(EALREADY_INITIALIZED));
        
        move_to(owner, IdentityStore {
            identities: table::new(),
            identity_events: account::new_event_handle<IdentityEvent>(owner),
            config_address,
        });
    }

    // Submit or update KYC data for a user
    // Only callable by the trusted issuer
    public entry fun submit_kyc(
        issuer: &signer,
        registry_addr: address,
        user: address,
        kyc_level: u8,
        credential_hash: vector<u8>
    ) acquires IdentityStore {
        // Validate KYC level
        assert!(
            kyc_level >= KYC_LEVEL_NONE && kyc_level <= KYC_LEVEL_FULL,
            error::invalid_argument(EINVALID_KYC_LEVEL)
        );

        assert!(exists<IdentityStore>(registry_addr), error::not_found(ENOT_INITIALIZED));
        let store = borrow_global_mut<IdentityStore>(registry_addr);

        // Check issuer authorization
        let trusted_issuer = KYCConfig::get_trusted_issuer(store.config_address);
        let issuer_addr = signer::address_of(issuer);
        assert!(issuer_addr == trusted_issuer, error::permission_denied(ENOT_AUTHORIZED));

        // Get current version or start at 0
        let version = if (table::contains(&store.identities, user)) {
            let existing = table::borrow(&store.identities, user);
            existing.version + 1
        } else {
            0
        };

        // Create or update identity
        let identity = Identity {
            wallet: user,
            kyc_level,
            credential_hash,
            verified: true,
            version,
        };

        if (table::contains(&store.identities, user)) {
            *table::borrow_mut(&mut store.identities, user) = identity;
        } else {
            table::add(&mut store.identities, user, identity);
        };

        // Emit event
        event::emit_event(&mut store.identity_events, IdentityEvent {
            wallet: user,
            kyc_level,
            verified: true,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    // Revoke KYC verification for a user
    // Only callable by the trusted issuer
    public entry fun revoke_kyc(
        issuer: &signer,
        registry_addr: address,
        user: address
    ) acquires IdentityStore {
        assert!(exists<IdentityStore>(registry_addr), error::not_found(ENOT_INITIALIZED));
        let store = borrow_global_mut<IdentityStore>(registry_addr);

        // Check issuer authorization
        let trusted_issuer = KYCConfig::get_trusted_issuer(store.config_address);
        let issuer_addr = signer::address_of(issuer);
        assert!(issuer_addr == trusted_issuer, error::permission_denied(ENOT_AUTHORIZED));

        // User must have an identity to revoke
        assert!(table::contains(&store.identities, user), error::not_found(EIDENTITY_NOT_FOUND));

        // Update identity to unverified
        let identity = table::borrow_mut(&mut store.identities, user);
        identity.verified = false;
        identity.version = identity.version + 1;

        // Emit event
        event::emit_event(&mut store.identity_events, IdentityEvent {
            wallet: user,
            kyc_level: identity.kyc_level,
            verified: false,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    #[view]
    public fun get_identity(registry_addr: address, user: address): Option<Identity> acquires IdentityStore {
        if (!exists<IdentityStore>(registry_addr)) {
            return option::none()
        };

        let store = borrow_global<IdentityStore>(registry_addr);
        if (table::contains(&store.identities, user)) {
            option::some(*table::borrow(&store.identities, user))
        } else {
            option::none()
        }
    }

    #[view]
    public fun is_verified(registry_addr: address, user: address): bool acquires IdentityStore {
        let identity_opt = get_identity(registry_addr, user);
        if (option::is_some(&identity_opt)) {
            let identity = option::extract(&mut identity_opt);
            identity.verified
        } else {
            false
        }
    }

    #[view]
    public fun get_kyc_level(registry_addr: address, user: address): u8 acquires IdentityStore {
        let identity_opt = get_identity(registry_addr, user);
        if (option::is_some(&identity_opt)) {
            let identity = option::extract(&mut identity_opt);
            identity.kyc_level
        } else {
            KYC_LEVEL_NONE
        }
    }

    #[view]
    public fun get_credential_hash(registry_addr: address, user: address): vector<u8> acquires IdentityStore {
        let identity_opt = get_identity(registry_addr, user);
        assert!(option::is_some(&identity_opt), error::not_found(EIDENTITY_NOT_FOUND));
        let identity = option::extract(&mut identity_opt);
        identity.credential_hash
    }

    #[test_only]
    public fun init_for_test(owner: &signer, config_address: address) {
        init(owner, config_address);
    }
}
