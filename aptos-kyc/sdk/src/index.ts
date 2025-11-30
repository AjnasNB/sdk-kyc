// Export main client
export { KycClient, createKycClient } from './client';

// Export types
export type {
    KycClientConfig,
    SessionResponse,
    SessionDetails,
    VerificationResponse,
    KycCompletionResponse,
    KycStatus,
    NftMintResponse,
    ApiErrorResponse,
    ApiSuccessResponse,
    ApiResponse,
    OnChainIdentity
} from './types';

// Export errors
export {
    KycError,
    NetworkError,
    ValidationError,
    AuthError,
    NotFoundError,
    ServerError,
    BlockchainError
} from './errors';

// Export Modules
export { AccessControl } from './modules/AccessControl';
export { Compliance } from './modules/Compliance';
export { Credentials } from './modules/Credentials';
export { FraudGuard } from './modules/FraudGuard';
export { Reputation } from './modules/Reputation';
