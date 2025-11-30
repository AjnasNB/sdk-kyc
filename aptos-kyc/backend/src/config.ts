import dotenv from 'dotenv';
import path from 'path';

// Load .env file - works for both CommonJS and ES modules
// Try loading from backend/.env first (if running from root), then .env (if running from backend)
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
    faceApiKey: string;
    faceApiEndpoint: string;
}

function validateEnv(): Config {
    const config = {
        port: parseInt(process.env.PORT || '3001', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
        databaseUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/aptos-kyc',
        aptosNodeUrl: process.env.APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com/v1',
        aptosFaucetUrl: process.env.APTOS_FAUCET_URL || 'https://faucet.testnet.aptoslabs.com',
        aptosIssuerPrivateKey: process.env.APTOS_ISSUER_PRIVATE_KEY!,
        aptosModuleAddress: process.env.APTOS_MODULE_ADDRESS || process.env.MODULE_ADDRESS!,
        aptosConfigAddress: process.env.APTOS_CONFIG_ADDRESS || process.env.APTOS_MODULE_ADDRESS || process.env.MODULE_ADDRESS!,
        aptosRegistryAddress: process.env.APTOS_REGISTRY_ADDRESS || process.env.APTOS_MODULE_ADDRESS || process.env.MODULE_ADDRESS!,
        aptosNftAddress: process.env.APTOS_NFT_ADDRESS || process.env.APTOS_MODULE_ADDRESS || process.env.MODULE_ADDRESS!,
        jwtSecret: process.env.JWT_SECRET || 'default_secret_please_change',
        apiKeyEnabled: process.env.API_KEY_ENABLED === 'true',
        rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
        rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
        corsOrigin: process.env.CORS_ORIGIN || '*',
        logLevel: process.env.LOG_LEVEL || 'info',
        faceApiKey: process.env.FACE_API_KEY!,
        faceApiEndpoint: process.env.FACE_ENDPOINT!
    };

    console.log("🔧 Config Loaded:");
    console.log("   - Port:", config.port);
    console.log("   - Module Address:", config.aptosModuleAddress);
    console.log("   - Face API Key Present:", !!config.faceApiKey);
    console.log("   - Face Endpoint:", config.faceApiEndpoint);

    return config;
}

export const config = validateEnv();
