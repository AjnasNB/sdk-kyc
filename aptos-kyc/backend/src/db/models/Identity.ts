import mongoose, { Schema, Document, Types } from 'mongoose';

// Identity Interface
export interface IIdentity extends Document {
    _id: Types.ObjectId;
    walletAddress: string;
    kycLevel: number;
    credentialHash: string;
    verified: boolean;
    lastTxHash?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Identity Schema
const IdentitySchema = new Schema<IIdentity>(
    {
        walletAddress: { type: String, required: true, unique: true, index: true },
        kycLevel: { type: Number, required: true, min: 0, max: 3 },
        credentialHash: { type: String, required: true },
        verified: { type: Boolean, default: true },
        lastTxHash: { type: String, default: null }
    },
    {
        timestamps: true,
        collection: 'identities'
    }
);

// Export Identity Model
export const Identity = mongoose.model<IIdentity>('Identity', IdentitySchema);
