import mongoose, { Document, Schema } from 'mongoose';

export interface IChargingStation extends Document {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  pricePerKwh: number;
  queueLength: number;
  amenities: string[];
  operatingHours: {
    open: string;
    close: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ChargingStationSchema = new Schema<IChargingStation>({
  name: {
    type: String,
    required: [true, 'Station name is required'],
    trim: true,
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90'],
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180'],
  },
  pricePerKwh: {
    type: Number,
    required: [true, 'Price per kWh is required'],
    min: [0, 'Price must be positive'],
  },
  queueLength: {
    type: Number,
    required: [true, 'Queue length is required'],
    min: [0, 'Queue length cannot be negative'],
    default: 0,
  },
  amenities: [{
    type: String,
    trim: true,
  }],
  operatingHours: {
    open: {
      type: String,
      required: [true, 'Opening hours are required'],
    },
    close: {
      type: String,
      required: [true, 'Closing hours are required'],
    },
  },
}, {
  timestamps: true,
});

export default mongoose.models.ChargingStation || mongoose.model<IChargingStation>('ChargingStation', ChargingStationSchema);