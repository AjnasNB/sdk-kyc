import mongoose from 'mongoose';
import { config } from '../config';

class Database {
    private static instance: Database;
    private isConnected: boolean = false;

    private constructor() { }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async connect(): Promise<void> {
        if (this.isConnected) {
            console.log('MongoDB already connected');
            return;
        }

        try {
            await mongoose.connect(config.databaseUrl);
            this.isConnected = true;
            console.log('✅ MongoDB connected successfully');

            // Handle connection events
            mongoose.connection.on('error', (error) => {
                console.error('MongoDB connection error:', error);
            });

            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB disconnected');
                this.isConnected = false;
            });

        } catch (error) {
            console.error('❌ MongoDB connection failed:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await mongoose.disconnect();
            this.isConnected = false;
            console.log('MongoDB disconnected successfully');
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    public isReady(): boolean {
        return this.isConnected && mongoose.connection.readyState === 1;
    }
}

// Export singleton instance
const db = Database.getInstance();

// Handle process termination
process.on('SIGINT', async () => {
    await db.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await db.disconnect();
    process.exit(0);
});

export default db;
