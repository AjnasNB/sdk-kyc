import mongoose, { Schema, Document, Types } from 'mongoose';

// Session Status Enum
export enum SessionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

// Session Interface
export interface ISession extends Document {
    _id: Types.ObjectId;
    walletAddress: string;
    email?: string;
    phone?: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    idVerified: boolean;
    idHash?: string;
    status: SessionStatus;
    createdAt: Date;
    updatedAt: Date;
}

// Session Schema
const SessionSchema = new Schema<ISession>(
    {
        walletAddress: { type: String, required: true, index: true },
        email: { type: String, default: null },
        phone: { type: String, default: null },
        emailVerified: { type: Boolean, default: false },
        phoneVerified: { type: Boolean, default: false },
        idVerified: { type: Boolean, default: false },
        idHash: { type: String, default: null },
        status: {
            type: String,
            enum: Object.values(SessionStatus),
            default: SessionStatus.PENDING
        }
    },
    {
        timestamps: true,
        collection: 'sessions'
    }
);

// Export Session Model
export const Session = mongoose.model<ISession>('Session', SessionSchema);
