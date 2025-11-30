import mongoose, { Document, Schema } from 'mongoose';

export interface IReputation extends Document {
    wallet: string;
    score: number;
    level: number;
    badges: string[];
    history: {
        action: string;
        change: number;
        timestamp: number;
    }[];
}

const ReputationSchema: Schema = new Schema({
    wallet: { type: String, required: true, unique: true },
    score: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    badges: [{ type: String }],
    history: [{
        action: String,
        change: Number,
        timestamp: { type: Number, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.model<IReputation>('Reputation', ReputationSchema);
