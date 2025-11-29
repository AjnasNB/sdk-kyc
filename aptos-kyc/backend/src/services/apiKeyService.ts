import crypto from 'crypto';
import { ApiKey } from '../db/models/ApiKey';
import { v4 as uuidv4 } from 'uuid';

class ApiKeyService {
    /**
     * Generate a new API key
     */
    async generateApiKey(label: string, rateLimitPerMinute: number = 100): Promise<string> {
        const key = `ak_${uuidv4().replace(/-/g, '')}`;

        await ApiKey.create({
            key,
            label,
            active: true,
            rateLimitPerMinute
        });

        return key;
    }

    /**
     * Validate API key
     */
    async validateApiKey(key: string): Promise<{ valid: boolean; rateLimitPerMinute: number }> {
        const apiKey = await ApiKey.findOne({ key });

        if (!apiKey || !apiKey.active) {
            return { valid: false, rateLimitPerMinute: 0 };
        }

        return { valid: true, rateLimitPerMinute: apiKey.rateLimitPerMinute };
    }

    /**
     * Revoke API key
     */
    async revokeApiKey(key: string): Promise<void> {
        await ApiKey.findOneAndUpdate(
            { key },
            { active: false }
        );
    }

    /**
     * List all API keys
     */
    async listApiKeys(): Promise<any[]> {
        return await ApiKey.find(
            {},
            {
                _id: 1,
                label: 1,
                active: 1,
                rateLimitPerMinute: 1,
                createdAt: 1
            }
        );
    }
}

export default new ApiKeyService();
