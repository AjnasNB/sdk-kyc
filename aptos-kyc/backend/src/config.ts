import dotenv from 'dotenv';
import path from 'path';

// Load .env file - works for both CommonJS and ES modules
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    aptosNodeUrl: string;
    aptosFaucetUrl: string;
    aptosIssuerPrivateKey: string;
    aptosModuleAddress: string;
    aptosConfigAddress: string;
    aptosRegistryAddress: string;
    aptosNftAddress: string;
    jwtSecret: string;
    apiKeyEnabled: boolean;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    corsOrigin: string;
    logLevel: string;
}

function validateEnv(): Config {
    const requiredEnvVars = [
        'MONGODB_URI',
        'APTOS_NODE_URL',
        'APTOS_ISSUER_PRIVATE_KEY',
        'APTOS_MODULE_ADDRESS',
        'JWT_SECRET'
    ];

    const missing = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    return {
        port: parseInt(process.env.PORT || '3001', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
        databaseUrl: process.env.MONGODB_URI!,
        aptosNodeUrl: process.env.APTOS_NODE_URL!,
        aptosFaucetUrl: process.env.APTOS_FAUCET_URL || 'https://faucet.testnet.aptoslabs.com',
        aptosIssuerPrivateKey: process.env.APTOS_ISSUER_PRIVATE_KEY!,
        aptosModuleAddress: process.env.APTOS_MODULE_ADDRESS!,
        aptosConfigAddress: process.env.APTOS_CONFIG_ADDRESS || process.env.APTOS_MODULE_ADDRESS!,
        aptosRegistryAddress: process.env.APTOS_REGISTRY_ADDRESS || process.env.APTOS_MODULE_ADDRESS!,
        aptosNftAddress: process.env.APTOS_NFT_ADDRESS || process.env.APTOS_MODULE_ADDRESS!,
        jwtSecret: process.env.JWT_SECRET!,
        apiKeyEnabled: process.env.API_KEY_ENABLED === 'true',
        rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
        rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
        corsOrigin: process.env.CORS_ORIGIN || '*',
        logLevel: process.env.LOG_LEVEL || 'info',
    };
}

export const config = validateEnv();
