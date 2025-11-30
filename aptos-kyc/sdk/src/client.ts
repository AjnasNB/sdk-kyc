import { AptosClient } from 'aptos';
import {
    KycClientConfig,
    SessionResponse,
    SessionDetails,
    VerificationResponse,
    KycCompletionResponse,
    KycStatus,
    NftMintResponse,
    ApiResponse,
    OnChainIdentity
} from './types';
import { NetworkError, handleApiError } from './errors';

import { AccessControl } from './modules/AccessControl';
import { Compliance } from './modules/Compliance';
import { Credentials } from './modules/Credentials';
import { FraudGuard } from './modules/FraudGuard';
import { Reputation } from './modules/Reputation';

export class KycClient {
    private apiBaseUrl: string;
    private apiKey?: string;
    private timeout: number;
    private aptosClient?: AptosClient;
    private moduleAddress: string;

    public accessControl: AccessControl;
    public compliance: Compliance;
    public credentials: Credentials;
    public fraud: FraudGuard;
    public reputation: Reputation;

    // Legacy support (to be deprecated or mapped)
    public did: Credentials;

    constructor(config: KycClientConfig) {
        this.apiBaseUrl = config.apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.apiKey = config.apiKey;
        this.timeout = config.timeout || 30000; // 30 seconds default
        this.moduleAddress = config.moduleAddress || "0x1"; // Default to 0x1 if not provided, but should be provided

        if (config.aptosNodeUrl) {
            this.aptosClient = new AptosClient(config.aptosNodeUrl);
        } else {
            // Create a default client if none provided, but this might fail if no URL
            this.aptosClient = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");
        }

        // Initialize Modules
        this.accessControl = new AccessControl(this.aptosClient, this.moduleAddress);
        this.compliance = new Compliance(this.aptosClient, this.moduleAddress);
        this.credentials = new Credentials(this.aptosClient, this.moduleAddress);
        this.fraud = new FraudGuard(this.aptosClient, this.moduleAddress);
        this.reputation = new Reputation(this.aptosClient, this.moduleAddress);

        // Alias for backward compatibility if needed
        this.did = this.credentials;
    }

    /**
     * Make HTTP request to API
     */
    public async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const headers: any = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.apiKey) {
            headers['x-api-key'] = this.apiKey;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                handleApiError(data, response.status);
            }

            return (data as any).data || data;
        } catch (error: any) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new NetworkError('Request timeout');
            }

            if (error.name === 'KycError' || error.name === 'ValidationError' ||
                error.name === 'AuthError' || error.name === 'NotFoundError' ||
                error.name === 'ServerError') {
                throw error;
            }

            throw new NetworkError(`Network request failed: ${error.message}`, error);
        }
    }

    /**
     * Start a new KYC session
     */
    async startSession(walletAddress: string): Promise<SessionResponse> {
        return this.request<SessionResponse>('/api/v1/session/start', {
            method: 'POST',
            body: JSON.stringify({ walletAddress }),
        });
    }

    /**
     * Get session details
     */
    async getSession(sessionId: string): Promise<SessionDetails> {
        return this.request<SessionDetails>(`/api/v1/session/${sessionId}`);
    }

    /**
     * Verify email address
     */
    async verifyEmail(sessionId: string, email: string, code?: string): Promise<VerificationResponse> {
        return this.request<VerificationResponse>('/api/v1/verify/email', {
            method: 'POST',
            body: JSON.stringify({ sessionId, email, code }),
        });
    }

    /**
     * Verify phone number
     */
    async verifyPhone(sessionId: string, phone: string, code?: string): Promise<VerificationResponse> {
        return this.request<VerificationResponse>('/api/v1/verify/phone', {
            method: 'POST',
            body: JSON.stringify({ sessionId, phone, code }),
        });
    }

    /**
     * Upload and verify ID document and Selfie (Face Verification)
     */
    async verifyFace(sessionId: string, idFile: File | Blob, selfieFile: File | Blob): Promise<VerificationResponse> {
        const url = `${this.apiBaseUrl}/api/v1/verify/face`;
        const formData = new FormData();
        formData.append('sessionId', sessionId);
        formData.append('idImage', idFile);
        formData.append('selfieImage', selfieFile);

        const headers: any = {};
        if (this.apiKey) {
            headers['x-api-key'] = this.apiKey;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                handleApiError(data, response.status);
            }

            return (data as any).data || data;
        } catch (error: any) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new NetworkError('Request timeout');
            }

            if (error.name === 'KycError' || error.name === 'ValidationError' ||
                error.name === 'AuthError' || error.name === 'NotFoundError' ||
                error.name === 'ServerError') {
                throw error;
            }

            throw new NetworkError(`Network request failed: ${error.message}`, error);
        }
    }

    /**
     * Complete KYC and submit to blockchain
     */
    async completeKyc(sessionId: string): Promise<KycCompletionResponse> {
        return this.request<KycCompletionResponse>('/api/v1/kyc/complete', {
            method: 'POST',
            body: JSON.stringify({ sessionId }),
        });
    }

    /**
     * Mint identity NFT for verified user
     */
    async mintNft(walletAddress: string): Promise<NftMintResponse> {
        return this.request<NftMintResponse>('/api/v1/kyc/mint-nft', {
            method: 'POST',
            body: JSON.stringify({ walletAddress }),
        });
    }

    /**
     * Get KYC status for a wallet address
     */
    async getStatus(walletAddress: string): Promise<KycStatus> {
        return this.request<KycStatus>(`/api/v1/status/${walletAddress}`);
    }

    /**
     * Get on-chain identity data directly from blockchain
     * Requires aptosNodeUrl to be configured
     */
    async getOnChainIdentity(
        walletAddress: string,
        moduleAddress?: string,
        registryAddress?: string
    ): Promise<OnChainIdentity | null> {
        if (!this.aptosClient) {
            throw new Error('Aptos client not configured. Provide aptosNodeUrl in config.');
        }

        const modAddr = moduleAddress || this.moduleAddress;
        const regAddr = registryAddress || this.moduleAddress;

        try {
            const result = await this.aptosClient.view({
                function: `${modAddr}::IdentityRegistry::get_identity`,
                type_arguments: [],
                arguments: [regAddr, walletAddress],
            });

            if (!result || result.length === 0) {
                return null;
            }

            const identityData: any = result[0];

            // Handle Option<Identity>
            if (!identityData || identityData.vec?.length === 0) {
                return null;
            }

            const identity = identityData.vec ? identityData.vec[0] : identityData;

            return {
                wallet: identity.wallet,
                kycLevel: parseInt(identity.kyc_level),
                credentialHash: identity.credential_hash,
                verified: identity.verified,
                version: identity.version ? parseInt(identity.version) : 0,
            };
        } catch (error) {
            console.error('Error fetching on-chain identity:', error);
            return null;
        }
    }

    /**
     * Check if wallet is verified on-chain
     */
    async isVerified(
        walletAddress: string,
        moduleAddress?: string,
        registryAddress?: string
    ): Promise<boolean> {
        if (!this.aptosClient) {
            throw new Error('Aptos client not configured. Provide aptosNodeUrl in config.');
        }

        const modAddr = moduleAddress || this.moduleAddress;
        const regAddr = registryAddress || this.moduleAddress;

        try {
            const result = await this.aptosClient.view({
                function: `${modAddr}::IdentityRegistry::is_verified`,
                type_arguments: [],
                arguments: [regAddr, walletAddress],
            });

            return result[0] as boolean;
        } catch (error) {
            console.error('Error checking verification status:', error);
            return false;
        }
    }
}

/**
 * Create a new KYC client instance
 */
export function createKycClient(config: KycClientConfig): KycClient {
    return new KycClient(config);
}
