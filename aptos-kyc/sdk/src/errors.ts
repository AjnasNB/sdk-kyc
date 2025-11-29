/**
 * Base error class for SDK errors
 */
export class KycError extends Error {
    public readonly code: string;
    public readonly statusCode?: number;
    public readonly details?: any;

    constructor(message: string, code: string, statusCode?: number, details?: any) {
        super(message);
        this.name = 'KycError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;

        // Maintains proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, KycError);
        }
    }
}

/**
 * Network/API request error
 */
export class NetworkError extends KycError {
    constructor(message: string, details?: any) {
        super(message, 'NETWORK_ERROR', undefined, details);
        this.name = 'NetworkError';
    }
}

/**
 * Validation error (400)
 */
export class ValidationError extends KycError {
    constructor(message: string, details?: any) {
        super(message, 'VALIDATION_ERROR', 400, details);
        this.name = 'ValidationError';
    }
}

/**
 * Authentication/authorization error (401/403)
 */
export class AuthError extends KycError {
    constructor(message: string, statusCode: number, details?: any) {
        super(message, 'AUTH_ERROR', statusCode, details);
        this.name = 'AuthError';
    }
}

/**
 * Resource not found error (404)
 */
export class NotFoundError extends KycError {
    constructor(message: string, details?: any) {
        super(message, 'NOT_FOUND', 404, details);
        this.name = 'NotFoundError';
    }
}

/**
 * Server error (500)
 */
export class ServerError extends KycError {
    constructor(message: string, details?: any) {
        super(message, 'SERVER_ERROR', 500, details);
        this.name = 'ServerError';
    }
}

/**
 * Blockchain transaction error
 */
export class BlockchainError extends KycError {
    constructor(message: string, details?: any) {
        super(message, 'BLOCKCHAIN_ERROR', undefined, details);
        this.name = 'BlockchainError';
    }
}

/**
 * Parse API error response and throw appropriate error
 */
export function handleApiError(response: any, statusCode: number): never {
    const message = response?.error || 'Unknown error occurred';
    const details = response?.details;

    if (statusCode === 400) {
        throw new ValidationError(message, details);
    } else if (statusCode === 401 || statusCode === 403) {
        throw new AuthError(message, statusCode, details);
    } else if (statusCode === 404) {
        throw new NotFoundError(message, details);
    } else if (statusCode >= 500) {
        throw new ServerError(message, details);
    } else {
        throw new KycError(message, 'UNKNOWN_ERROR', statusCode, details);
    }
}
