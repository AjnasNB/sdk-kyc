import { AptosClient, AptosAccount, HexString } from 'aptos';
import { config } from '../config';

class AptosService {
    private client: AptosClient;
    private issuerAccount: AptosAccount;

    constructor() {
        this.client = new AptosClient(config.aptosNodeUrl);

        // Handle different private key formats
        let privateKeyHex = config.aptosIssuerPrivateKey;

        // Strip "ed25519-priv-" prefix (from Petra wallet)
        if (privateKeyHex.startsWith('ed25519-priv-')) {
            privateKeyHex = privateKeyHex.substring(13);
        }

        // Strip "0x" prefix if present
        if (privateKeyHex.startsWith('0x')) {
            privateKeyHex = privateKeyHex.substring(2);
        }

        // Validate 64-character hex string
        if (!privateKeyHex || privateKeyHex.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(privateKeyHex)) {
            throw new Error(
                `\n❌ Invalid APTOS_ISSUER_PRIVATE_KEY!\n\n` +
                `Current value: "${config.aptosIssuerPrivateKey}"\n\n` +
                `Valid formats:\n` +
                `  - Petra: ed25519-priv-0x1234...abcd\n` +
                `  - CLI: 0x1234...abcd\n\n` +
                `Get your key from Petra Wallet → Settings → Show Private Key\n`
            );
        }

        this.issuerAccount = new AptosAccount(new HexString(privateKeyHex).toUint8Array());
        console.log(`✅ Aptos account: ${this.issuerAccount.address().hex()}`);
    }

    async submitKycTx(userAddress: string, kycLevel: number, credentialHashHex: string): Promise<string> {
        if (process.env.ENABLE_MOCK_CHAIN === 'true') {
            console.log(`[MOCK] Submitting KYC for ${userAddress} (Level ${kycLevel})`);
            return '0x' + Array(64).fill('0').join(''); // Mock hash
        }

        try {
            const hashBytes = new HexString(credentialHashHex).toUint8Array();

            const payload = {
                function: `${config.aptosModuleAddress}::IdentityRegistry::submit_kyc`,
                type_arguments: [],
                arguments: [config.aptosRegistryAddress, userAddress, kycLevel, Array.from(hashBytes)],
            };

            const rawTxn = await this.client.generateTransaction(this.issuerAccount.address(), payload);
            const signedTxn = await this.client.signTransaction(this.issuerAccount, rawTxn);
            const result = await this.client.submitTransaction(signedTxn);
            await this.client.waitForTransaction(result.hash);

            return result.hash;
        } catch (error) {
            console.error('KYC submit error:', error);
            throw new Error(`Failed to submit KYC: ${error}`);
        }
    }

    async revokeKycTx(userAddress: string): Promise<string> {
        try {
            const payload = {
                function: `${config.aptosModuleAddress}::IdentityRegistry::revoke_kyc`,
                type_arguments: [],
                arguments: [config.aptosRegistryAddress, userAddress],
            };

            const rawTxn = await this.client.generateTransaction(this.issuerAccount.address(), payload);
            const signedTxn = await this.client.signTransaction(this.issuerAccount, rawTxn);
            const result = await this.client.submitTransaction(signedTxn);
            await this.client.waitForTransaction(result.hash);

            return result.hash;
        } catch (error) {
            console.error('KYC revoke error:', error);
            throw new Error(`Failed to revoke KYC: ${error}`);
        }
    }

    async getIdentityView(userAddress: string): Promise<IdentityFromChain | null> {
        if (process.env.ENABLE_MOCK_CHAIN === 'true') {
            return {
                wallet: userAddress,
                kycLevel: 3,
                credentialHash: [],
                verified: true,
                version: 1
            };
        }

        try {
            const result = await this.client.view({
                function: `${config.aptosModuleAddress}::IdentityRegistry::get_identity`,
                type_arguments: [],
                arguments: [config.aptosRegistryAddress, userAddress],
            });

            if (!result || result.length === 0) return null;

            const data: any = result[0];
            if (!data || data.vec?.length === 0) return null;

            const identity = data.vec ? data.vec[0] : data;
            return {
                wallet: identity.wallet,
                kycLevel: parseInt(identity.kyc_level),
                credentialHash: identity.credential_hash,
                verified: identity.verified,
                version: identity.version ? parseInt(identity.version) : 0,
            };
        } catch (error) {
            console.error('Get identity error:', error);
            return null;
        }
    }

    async isVerified(userAddress: string): Promise<boolean> {
        try {
            const result = await this.client.view({
                function: `${config.aptosModuleAddress}::IdentityRegistry::is_verified`,
                type_arguments: [],
                arguments: [config.aptosRegistryAddress, userAddress],
            });
            return result[0] as boolean;
        } catch (error) {
            return false;
        }
    }

    async mintIdentityNft(userAddress: string): Promise<string> {
        if (process.env.ENABLE_MOCK_CHAIN === 'true') {
            console.log(`[MOCK] Minting NFT for ${userAddress}`);
            return '0x' + Array(64).fill('0').join('');
        }

        try {
            const payload = {
                function: `${config.aptosModuleAddress}::IdentityNFT::mint_identity_nft`,
                type_arguments: [],
                arguments: [config.aptosNftAddress, userAddress],
            };

            const rawTxn = await this.client.generateTransaction(this.issuerAccount.address(), payload);
            const signedTxn = await this.client.signTransaction(this.issuerAccount, rawTxn);
            const result = await this.client.submitTransaction(signedTxn);
            await this.client.waitForTransaction(result.hash);

            return result.hash;
        } catch (error) {
            console.error('NFT mint error:', error);
            throw new Error(`Failed to mint NFT: ${error}`);
        }
    }

    getIssuerAddress(): string {
        return this.issuerAccount.address().hex();
    }
}

export interface IdentityFromChain {
    wallet: string;
    kycLevel: number;
    credentialHash: number[] | string;
    verified: boolean;
    version: number;
}

export default new AptosService();
