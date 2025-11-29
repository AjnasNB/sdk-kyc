import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import apiKeyService from '../services/apiKeyService';

/**
 * API Key authentication middleware
 * Validates x-api-key header if API key auth is enabled
 */
export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
    // Skip if API key auth is disabled
    if (!config.apiKeyEnabled) {
        return next();
    }

    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'API key required. Provide x-api-key header'
        });
    }

    try {
        const validation = await apiKeyService.validateApiKey(apiKey);

        if (!validation.valid) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or inactive API key'
            });
        }

        // Attach API key info to request for rate limiter
        (req as any).apiKey = apiKey;
        (req as any).apiKeyLimit = validation.rateLimitPerMinute;

        next();
    } catch (error) {
        console.error('[AUTH] API key validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Error validating API key'
        });
    }
}
