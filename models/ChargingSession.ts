import mongoose, { Document, Schema } from 'mongoose';

export interface IChargingSession extends Document {
  _id: string;
  userId: string;
  stationId: string;
  joinedAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'cancelled';
  queuePosition: number;
  estimatedWaitTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChargingSessionSchema = new Schema<IChargingSession>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User',
  },
  stationId: {
    type: String,
    required: [true, 'Station ID is required'],
    ref: 'ChargingStation',
  },
  joinedAt: {
    type: Date,
    required: [true, 'Join time is required'],
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    required: [true, 'Status is required'],
    default: 'active',
  },
  queuePosition: {
    type: Number,
    required: [true, 'Queue position is required'],
    min: [1, 'Queue position must be at least 1'],
  },
  estimatedWaitTime: {
    type: Number,
    min: [0, 'Estimated wait time cannot be negative'],
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
ChargingSessionSchema.index({ userId: 1, status: 1 });
ChargingSessionSchema.index({ stationId: 1, status: 1 });
ChargingSessionSchema.index({ stationId: 1, queuePosition: 1 });
ChargingSessionSchema.index({ status: 1, joinedAt: 1 });

export default mongoose.models.ChargingSession || mongoose.model<IChargingSession>('ChargingSession', ChargingSessionSchema);