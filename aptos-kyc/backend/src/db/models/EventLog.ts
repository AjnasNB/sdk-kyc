import mongoose, { Document, Schema } from 'mongoose';

export interface IEventLog extends Document {
    type: string;       // e.g., "CredentialIssued", "ScoreUpdated"
    module: string;     // e.g., "CredentialRegistry"
    data: any;          // The event payload
    version: number;    // Blockchain version
    sequenceNumber: number;
    timestamp: number;
}

const EventLogSchema: Schema = new Schema({
    type: { type: String, required: true },
    module: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    version: { type: Number, required: true, unique: true }, // Ensure no duplicates
    sequenceNumber: { type: Number, required: true },
    timestamp: { type: Number, default: Date.now }
}, { timestamps: true });

// Index for fast querying
EventLogSchema.index({ type: 1, timestamp: -1 });

export default mongoose.model<IEventLog>('EventLog', EventLogSchema);
