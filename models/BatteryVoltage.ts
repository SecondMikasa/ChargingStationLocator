import mongoose, { Document, Schema } from 'mongoose';

export interface IBatteryVoltage extends Document {
  _id: string;
  voltage: number;
  percentage: number;
  timestamp: Date;
  status: 'normal' | 'low' | 'critical';
  vehicleId: string;
  userId: mongoose.Types.ObjectId;
  deviceId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BatteryVoltageSchema = new Schema<IBatteryVoltage>({
  voltage: {
    type: Number,
    required: [true, 'Voltage is required'],
    min: [0, 'Voltage must be positive'],
  },
  percentage: {
    type: Number,
    required: [true, 'Percentage is required'],
    min: [0, 'Percentage must be at least 0'],
    max: [100, 'Percentage must be at most 100'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['normal', 'low', 'critical'],
    required: [true, 'Status is required'],
  },
  vehicleId: {
    type: String,
    required: [true, 'Vehicle ID is required'],
    trim: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  deviceId: {
    type: Schema.Types.ObjectId,
    ref: 'UserDevice',
    required: [true, 'Device ID is required'],
  },
}, {
  timestamps: true,
});

// Create indexes for efficient queries
BatteryVoltageSchema.index({ userId: 1, timestamp: -1 });
BatteryVoltageSchema.index({ deviceId: 1, timestamp: -1 });
BatteryVoltageSchema.index({ vehicleId: 1, timestamp: -1 });
BatteryVoltageSchema.index({ timestamp: -1 });

export default mongoose.models.BatteryVoltage || mongoose.model<IBatteryVoltage>('BatteryVoltage', BatteryVoltageSchema);