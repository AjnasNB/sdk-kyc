import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config';
import db from './db/dbClient';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { globalRateLimiter } from './middleware/rateLimiter';
import { apiKeyAuth } from './middleware/apiKeyAuth';

// Import routes
import sessionRoutes from './routes/sessionRoutes';
import verifyRoutes from './routes/verifyRoutes';
import kycRoutes from './routes/kycRoutes';
import statusRoutes from './routes/statusRoutes';

const app: Application = express();

// CORS configuration
app.use(cors({
    origin: config.corsOrigin,
    credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiting
app.use(globalRateLimiter);

// API key authentication (if enabled)
app.use(apiKeyAuth);

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Aptos KYC API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: db.isReady() ? 'connected' : 'disconnected'
    });
});

// API routes (v1)
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/session`, sessionRoutes);
app.use(`${API_PREFIX}/verify`, verifyRoutes);
app.use(`${API_PREFIX}/kyc`, kycRoutes);
app.use(`${API_PREFIX}/status`, statusRoutes);

// 404 handler
app.use(notFoundHandler);

import * as superController from './controllers/superController';

// ... existing routes ...

// Super-SDK Routes
// DID
app.post('/api/v1/did/issue', superController.issueCredential);
app.get('/api/v1/did/:wallet', superController.getCredentials);

// Reputation
app.get('/api/v1/repute/:wallet', superController.getReputation);
app.post('/api/v1/repute/calculate', superController.calculateScore);

// FraudGuard
app.get('/api/v1/fraud/:wallet', superController.checkRisk);
app.post('/api/v1/fraud/analyze', superController.analyzeWallet);

import * as adminController from './controllers/adminController';

// ... existing routes ...

// Admin Routes
app.get('/api/v1/admin/dashboard', adminController.getDashboardStats);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

async function startServer() {
    try {
        // Connect to MongoDB
        await db.connect();

        app.listen(PORT, () => {
            console.log('');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🚀 Aptos KYC API Server');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`📡 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${config.nodeEnv}`);
            console.log(`🔗 API Base: http://localhost:${PORT}${API_PREFIX}`);
            console.log(`⛓️  Aptos Network: ${config.aptosNodeUrl}`);
            console.log(`🔐 API Key Auth: ${config.apiKeyEnabled ? 'Enabled' : 'Disabled'}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('');
            console.log('Available endpoints:');
            console.log(`  GET  /health`);
        });

        process.on('SIGINT', async () => {
            console.log('\nSIGINT received, shutting down gracefully...');
            await db.disconnect();
            process.exit(0);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

export default app;
