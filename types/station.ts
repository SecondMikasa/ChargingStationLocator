// Charging station types
export interface ChargingStation {
  id?: string;
  _id?: string | { toString(): string }; // MongoDB ObjectId
  name: string;
  latitude: number;
  longitude: number;
  pricePerKwh: number;
  queueLength: number;
  distance?: number; // Calculated based on user location
  amenities?: string[];
  operatingHours?: {
    open: string;
    close: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StationSearchParams {
  latitude: number;
  longitude: number;
  radius?: number; // in kilometers
  maxResults?: number;
}

export interface StationFormData {
  name: string;
  latitude: number;
  longitude: number;
  pricePerKwh: number;
  queueLength: number;
}