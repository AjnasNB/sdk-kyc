module kyc::IdentityNFT {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_token::token::{Self, TokenDataId};
    use kyc::KYCConfig;
    use kyc::IdentityRegistry;

    // Error codes
    const EALREADY_INITIALIZED: u64 = 1;
    const ENOT_AUTHORIZED: u64 = 2;
    const ENOT_VERIFIED: u64 = 3;
    const EALREADY_MINTED: u64 = 4;
    const ENOT_INITIALIZED: u64 = 5;

    // Collection and token metadata
    const COLLECTION_NAME: vector<u8> = b"Aptos KYC Identity";
    const COLLECTION_DESCRIPTION: vector<u8> = b"Soulbound identity NFTs for verified Aptos users";
    const COLLECTION_URI: vector<u8> = b"https://aptos-kyc.cognifyr.com/collection";
    const TOKEN_NAME_PREFIX: vector<u8> = b"KYC Identity #";

    // NFT minting event
    struct MintEvent has store, drop {
        user: address,
        token_id: TokenDataId,
        kyc_level: u8,
        timestamp: u64,
    }

    // Resource tracking minted NFTs and events
    struct NFTStore has key {
        minted_tokens: vector<address>,
        mint_events: EventHandle<MintEvent>,
        config_address: address,
        registry_address: address,
        collection_name: String,
    }

    // Initialize the NFT collection
    // Must be called once before minting
    public entry fun init_collection(
        creator: &signer,
        config_address: address,
        registry_address: address
    ) {
        let creator_addr = signer::address_of(creator);
        assert!(!exists<NFTStore>(creator_addr), error::already_exists(EALREADY_INITIALIZED));

        // Create the collection with maximum supply
        let collection_name = string::utf8(COLLECTION_NAME);
        let description = string::utf8(COLLECTION_DESCRIPTION);
        let uri = string::utf8(COLLECTION_URI);
        
        token::create_collection(
            creator,
            collection_name,
            description,
            uri,
            0, // maximum (0 = unlimited)
            vector<bool>[false, false, false] // mutability vector [description, uri, maximum]
        );

        // Initialize store
        move_to(creator, NFTStore {
            minted_tokens: vector::empty(),
            mint_events: account::new_event_handle<MintEvent>(creator),
            config_address,
            registry_address,
            collection_name,
        });
    }

    // Mint a soulbound identity NFT for a verified user
    // Only callable by trusted issuer
    public entry fun mint_identity_nft(
        issuer: &signer,
        nft_store_addr: address,
        user: address
    ) acquires NFTStore {
        assert!(exists<NFTStore>(nft_store_addr), error::not_found(ENOT_INITIALIZED));
        let store = borrow_global_mut<NFTStore>(nft_store_addr);

        // Check issuer authorization
        let trusted_issuer = KYCConfig::get_trusted_issuer(store.config_address);
        let issuer_addr = signer::address_of(issuer);
        assert!(issuer_addr == trusted_issuer, error::permission_denied(ENOT_AUTHORIZED));

        // Check user is verified in registry
        assert!(
            IdentityRegistry::is_verified(store.registry_address, user),
            error::permission_denied(ENOT_VERIFIED)
        );

        // Check if user already has NFT
        assert!(
            !vector::contains(&store.minted_tokens, &user),
            error::already_exists(EALREADY_MINTED)
        );

        // Get KYC level for metadata
        let kyc_level = IdentityRegistry::get_kyc_level(store.registry_address, user);

        // Create token name with sequential ID
        let token_count = vector::length(&store.minted_tokens);
        let token_name = string::utf8(TOKEN_NAME_PREFIX);
        let count_str = u64_to_string(token_count + 1);
        string::append(&mut token_name, count_str);

        // Create token URI with KYC level
        let token_uri = string::utf8(b"https://aptos-kyc.cognifyr.com/nft/");
        string::append(&mut token_uri, u64_to_string((kyc_level as u64)));

        // Create token data
        let token_data_id = token::create_tokendata(
            issuer,
            store.collection_name,
            token_name,
            string::utf8(b"Verified Aptos Identity - Non-transferable"),
            1, // maximum (only 1 per person)
            token_uri,
            issuer_addr,
            0, // royalty numerator
            100, // royalty denominator
            token::create_token_mutability_config(&vector<bool>[false, false, false, false, false]), // all immutable
            vector<String>[], // property keys
            vector<vector<u8>>[], // property values
            vector<String>[], // property types
        );

        // Mint token to user
        let token_id = token::mint_token(
            issuer,
            token_data_id,
            1 // amount
        );

        // Transfer to user (creates offer)
        token::transfer(issuer, token_id, user, 1);

        // Record minting
        vector::push_back(&mut store.minted_tokens, user);

        // Emit event
        event::emit_event(&mut store.mint_events, MintEvent {
            user,
            token_id: token_data_id,
            kyc_level,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    #[view]
    public fun has_nft(nft_store_addr: address, user: address): bool acquires NFTStore {
        if (!exists<NFTStore>(nft_store_addr)) {
            return false
        };
        let store = borrow_global<NFTStore>(nft_store_addr);
        vector::contains(&store.minted_tokens, &user)
    }

    #[view]
    public fun get_total_minted(nft_store_addr: address): u64 acquires NFTStore {
        if (!exists<NFTStore>(nft_store_addr)) {
            return 0
        };
        let store = borrow_global<NFTStore>(nft_store_addr);
        vector::length(&store.minted_tokens)
    }

    // Helper function to convert u64 to string
    fun u64_to_string(value: u64): String {
        if (value == 0) {
            return string::utf8(b"0")
        };

        let buffer = vector::empty<u8>();
        while (value != 0) {
            let digit = ((value % 10) as u8);
            vector::push_back(&mut buffer, digit + 48); // ASCII '0' = 48
            value = value / 10;
        };

        vector::reverse(&mut buffer);
        string::utf8(buffer)
    }

    #[test_only]
    public fun init_for_test(creator: &signer, config_address: address, registry_address: address) {
        init_collection(creator, config_address, registry_address);
    }
}
