/**
 * SDK Configuration
 */
export interface KycClientConfig {
    /** Base URL of the KYC API server */
    apiBaseUrl: string;

    /** Aptos node URL for on-chain queries (optional) */
    aptosNodeUrl?: string;

    /** API key for authenticated requests (optional) */
    apiKey?: string;

    /** Request timeout in milliseconds */
    timeout?: number;

    /** Address where the KYC modules are deployed */
    moduleAddress?: string;
}

/**
 * Session response from API
 */
export interface SessionResponse {
    sessionId: string;
    walletAddress: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: string;
}

/**
 * Session details
 */
export interface SessionDetails extends SessionResponse {
    email?: string;
    phone?: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    idVerified: boolean;
    updatedAt: string;
}

/**
 * Verification response
 */
export interface VerificationResponse {
    success: boolean;
    message?: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    idVerified?: boolean;
    idHash?: string;
}

/**
 * KYC completion response
 */
export interface KycCompletionResponse {
    txHash: string;
    kycLevel: number;
    explorerUrl?: string;
}

/**
 * KYC status
 */
export interface KycStatus {
    walletAddress: string;
    verified: boolean;
    kycLevel: number;
    credentialHash: string | null;
    lastTxHash: string | null;
    version?: number;
}

/**
 * NFT mint response
 */
export interface NftMintResponse {
    txHash: string;
    explorerUrl?: string;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
    success: false;
    error: string;
    details?: any;
}

/**
 * API success response
 */
export interface ApiSuccessResponse<T = any> {
    success: true;
    message?: string;
    data: T;
}

/**
 * Generic API response
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * On-chain identity data
 */
export interface OnChainIdentity {
    wallet: string;
    kycLevel: number;
    credentialHash: number[] | string;
    verified: boolean;
    version: number;
}
