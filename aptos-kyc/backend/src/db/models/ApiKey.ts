import mongoose, { Schema, Document, Types } from 'mongoose';

// ApiKey Interface
export interface IApiKey extends Document {
    _id: Types.ObjectId;
    key: string;
    label: string;
    active: boolean;
    rateLimitPerMinute: number;
    createdAt: Date;
    updatedAt: Date;
}

// API Key Schema
const ApiKeySchema = new Schema<IApiKey>(
    {
        key: { type: String, required: true, unique: true, index: true },
        label: { type: String, required: true },
        active: { type: Boolean, default: true },
        rateLimitPerMinute: { type: Number, default: 100 }
    },
    {
        timestamps: true,
        collection: 'api_keys'
    }
);

// Export ApiKey Model
export const ApiKey = mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
