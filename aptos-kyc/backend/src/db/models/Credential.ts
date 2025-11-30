import mongoose, { Document, Schema } from 'mongoose';

export interface ICredential extends Document {
    id: string;
    type: string;
    issuer: string;
    holder: string;
    issuanceDate: number;
    expirationDate: number;
    dataHash: string;
    revoked: boolean;
    metadata: any; // Off-chain metadata
}

const CredentialSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    issuer: { type: String, required: true },
    holder: { type: String, required: true },
    issuanceDate: { type: Number, required: true },
    expirationDate: { type: Number, default: 0 },
    dataHash: { type: String, required: true },
    revoked: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.model<ICredential>('Credential', CredentialSchema);
