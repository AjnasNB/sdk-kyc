import rateLimit from 'express-rate-limit';
import { config } from '../config';

/**
 * Global rate limiter
 * Applied to all routes
 */
export const globalRateLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
    message: {
        success: false,
        error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict rate limiter for sensitive endpoints
 * Used for verification and KYC completion
 */
export const strictRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: {
        success: false,
        error: 'Too many attempts, please wait before trying again'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * API key-based rate limiter
 * Uses custom limit per API key
 */
export const apiKeyRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: async (req) => {
        // Get limit from API key validation in previous middleware
        return (req as any).apiKeyLimit || 100;
    },
    message: {
        success: false,
        error: 'API key rate limit exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use API key as identifier instead of IP
        return (req as any).apiKey || req.ip;
    }
});
