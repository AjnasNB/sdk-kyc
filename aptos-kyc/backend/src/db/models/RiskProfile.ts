import mongoose, { Document, Schema } from 'mongoose';

export interface IRiskProfile extends Document {
    wallet: string;
    riskScore: number;
    isBlacklisted: boolean;
    flags: string[];
    lastCheck: number;
}

const RiskProfileSchema: Schema = new Schema({
    wallet: { type: String, required: true, unique: true },
    riskScore: { type: Number, default: 0 },
    isBlacklisted: { type: Boolean, default: false },
    flags: [{ type: String }],
    lastCheck: { type: Number, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IRiskProfile>('RiskProfile', RiskProfileSchema);
