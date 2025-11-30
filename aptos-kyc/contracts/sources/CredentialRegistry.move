module kyc::CredentialRegistry {
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
    const ECREDENTIAL_NOT_FOUND: u64 = 2;
    const ECREDENTIAL_ALREADY_EXISTS: u64 = 3;
    const ECREDENTIAL_REVOKED: u64 = 4;
    const EINVALID_PROOF: u64 = 5;

    // Credential Structure
    struct Credential has store, drop, copy {
        id: String,           // Unique Credential ID
        type_name: String,    // e.g., "VerifiedHuman", "Over18"
        issuer: address,      // Who issued it
        holder: address,      // Who holds it
        issuance_date: u64,
        expiration_date: u64, // 0 for no expiration
        data_hash: vector<u8>,// Hash of the off-chain data
        revoked: bool,
    }

    // Events
    struct CredentialIssuedEvent has store, drop {
        id: String,
        type_name: String,
        holder: address,
        issuer: address,
        timestamp: u64,
    }

    struct CredentialRevokedEvent has store, drop {
        id: String,
        holder: address,
        timestamp: u64,
    }

    // Global Store
    struct CredentialStore has key {
        credentials: vector<Credential>,
        issue_events: EventHandle<CredentialIssuedEvent>,
        revoke_events: EventHandle<CredentialRevokedEvent>,
        config_address: address,
    }

    // Initialize the registry
    public entry fun init_registry(owner: &signer, config_address: address) {
        let owner_addr = signer::address_of(owner);
        if (!exists<CredentialStore>(owner_addr)) {
            move_to(owner, CredentialStore {
                credentials: vector::empty(),
                issue_events: account::new_event_handle<CredentialIssuedEvent>(owner),
                revoke_events: account::new_event_handle<CredentialRevokedEvent>(owner),
                config_address,
            });
        }
    }

    // Issue a new credential
    public entry fun issue_credential(
        issuer: &signer,
        registry_addr: address,
        holder: address,
        id: String,
        type_name: String,
        expiration_date: u64,
        data_hash: vector<u8>
    ) acquires CredentialStore {
        let store = borrow_global_mut<CredentialStore>(registry_addr);
        
        // Check authorization
        let issuer_addr = signer::address_of(issuer);
        let trusted_issuer = KYCConfig::get_trusted_issuer(store.config_address);
        assert!(issuer_addr == trusted_issuer, error::permission_denied(ENOT_AUTHORIZED));

        // Create credential
        let credential = Credential {
            id,
            type_name,
            issuer: issuer_addr,
            holder,
            issuance_date: timestamp::now_seconds(),
            expiration_date,
            data_hash,
            revoked: false,
        };

        vector::push_back(&mut store.credentials, credential);

        // Emit event
        event::emit_event(&mut store.issue_events, CredentialIssuedEvent {
            id,
            type_name,
            holder,
            issuer: issuer_addr,
            timestamp: timestamp::now_seconds(),
        });
    }

    // Revoke a credential
    public entry fun revoke_credential(
        issuer: &signer,
        registry_addr: address,
        id: String
    ) acquires CredentialStore {
        let store = borrow_global_mut<CredentialStore>(registry_addr);
        
        // Check authorization
        let issuer_addr = signer::address_of(issuer);
        let trusted_issuer = KYCConfig::get_trusted_issuer(store.config_address);
        assert!(issuer_addr == trusted_issuer, error::permission_denied(ENOT_AUTHORIZED));

        // Find and revoke
        let len = vector::length(&store.credentials);
        let i = 0;
        let found = false;
        while (i < len) {
            let cred = vector::borrow_mut(&mut store.credentials, i);
            if (cred.id == id) {
                cred.revoked = true;
                found = true;
                
                event::emit_event(&mut store.revoke_events, CredentialRevokedEvent {
                    id,
                    holder: cred.holder,
                    timestamp: timestamp::now_seconds(),
                });
                break
            };
            i = i + 1;
        };
        assert!(found, error::not_found(ECREDENTIAL_NOT_FOUND));
    }

    // Verify a ZK proof (Stub for now)
    // In production, this would verify a Groth16/Plonk proof
    public fun verify_proof(_proof: vector<u8>, _public_inputs: vector<u8>): bool {
        // TODO: Integrate actual ZK verifier
        true
    }

    #[view]
    public fun get_credentials(registry_addr: address, holder: address): vector<Credential> acquires CredentialStore {
        if (!exists<CredentialStore>(registry_addr)) {
            return vector::empty()
        };
        
        let store = borrow_global<CredentialStore>(registry_addr);
        let result = vector::empty();
        let len = vector::length(&store.credentials);
        let i = 0;
        
        while (i < len) {
            let cred = vector::borrow(&store.credentials, i);
            if (cred.holder == holder && !cred.revoked) {
                vector::push_back(&mut result, *cred);
            };
            i = i + 1;
        };
        result
    }

    #[view]
    public fun has_credential(registry_addr: address, holder: address, type_name: String): bool acquires CredentialStore {
        if (!exists<CredentialStore>(registry_addr)) {
            return false
        };

        let store = borrow_global<CredentialStore>(registry_addr);
        let len = vector::length(&store.credentials);
        let i = 0;
        
        while (i < len) {
            let cred = vector::borrow(&store.credentials, i);
            if (cred.holder == holder && cred.type_name == type_name && !cred.revoked) {
                // Check expiration
                if (cred.expiration_date == 0 || cred.expiration_date > timestamp::now_seconds()) {
                    return true
                }
            };
            i = i + 1;
        };
        false
    }
}
