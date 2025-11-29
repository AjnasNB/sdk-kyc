module kyc::KYCConfig {
    use std::signer;
    use std::error;


    // Error codes
    const EALREADY_INITIALIZED: u64 = 1;
    const ENOT_AUTHORIZED: u64 = 2;
    const ENOT_INITIALIZED: u64 = 3;

    // Configuration resource stored at module address
    struct Config has key {
        owner: address,
        trusted_issuer: address,
    }

    // Initialize the KYC configuration
    // Can only be called once by the module deployer
    public entry fun init_config(owner: &signer, issuer: address) {
        let owner_addr = signer::address_of(owner);
        assert!(!exists<Config>(owner_addr), error::already_exists(EALREADY_INITIALIZED));
        
        move_to(owner, Config {
            owner: owner_addr,
            trusted_issuer: issuer,
        });
    }

    // Update the trusted issuer address
    // Only callable by the config owner
    public entry fun set_trusted_issuer(owner: &signer, issuer: address) acquires Config {
        let owner_addr = signer::address_of(owner);
        assert!(exists<Config>(owner_addr), error::not_found(ENOT_INITIALIZED));
        
        let config = borrow_global_mut<Config>(owner_addr);
        assert!(config.owner == owner_addr, error::permission_denied(ENOT_AUTHORIZED));
        
        config.trusted_issuer = issuer;
    }

    #[view]
    public fun get_trusted_issuer(config_addr: address): address acquires Config {
        assert!(exists<Config>(config_addr), error::not_found(ENOT_INITIALIZED));
        borrow_global<Config>(config_addr).trusted_issuer
    }

    #[view]
    public fun get_owner(config_addr: address): address acquires Config {
        assert!(exists<Config>(config_addr), error::not_found(ENOT_INITIALIZED));
        borrow_global<Config>(config_addr).owner
    }

    #[view]
    public fun is_initialized(config_addr: address): bool {
        exists<Config>(config_addr)
    }

    #[test_only]
    public fun init_for_test(owner: &signer, issuer: address) {
        init_config(owner, issuer);
    }
}
