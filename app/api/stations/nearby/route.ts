import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChargingStation from '@/models/ChargingStation';
import { z } from 'zod';

// Validation schema for query parameters
const NearbyStationsSchema = z.object({
  lat: z.string().transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num < -90 || num > 90) {
      throw new Error('Invalid latitude');
    }
    return num;
  }),
  lng: z.string().transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num < -180 || num > 180) {
      throw new Error('Invalid longitude');
    }
    return num;
  }),
  radius: z.string().optional().transform((val) => {
    if (!val) return 10; // Default 10km radius
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0 || num > 100) {
      throw new Error('Invalid radius');
    }
    return num;
  }),
  limit: z.string().optional().transform((val) => {
    if (!val) return 20; // Default 20 results
    const num = parseInt(val);
    if (isNaN(num) || num <= 0 || num > 100) {
      throw new Error('Invalid limit');
    }
    return num;
  }),
});

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      lat: searchParams.get('lat'),
      lng: searchParams.get('lng'),
      radius: searchParams.get('radius'),
      limit: searchParams.get('limit'),
    };

    // Validate required parameters
    if (!queryParams.lat || !queryParams.lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const validatedParams = NearbyStationsSchema.parse(queryParams);
    const { lat, lng, radius, limit } = validatedParams;

    // Connect to database
    await connectDB();

    // Get all stations (we'll filter by distance in memory for simplicity)
    // In a production app, you'd use MongoDB's geospatial queries
    const allStations = await ChargingStation.find({}).lean();

    // Calculate distances and filter by radius
    const stationsWithDistance = allStations
      .map((station) => {
        const distance = calculateDistance(lat, lng, station.latitude, station.longitude);
        return {
          id: station._id as string,
          name: station.name,
          latitude: station.latitude,
          longitude: station.longitude,
          pricePerKwh: station.pricePerKwh,
          queueLength: station.queueLength,
          distance,
          amenities: station.amenities || [],
          operatingHours: station.operatingHours,
        };
      })
      .filter((station) => station.distance <= radius)
      .sort((a, b) => a.distance - b.distance) // Sort by distance (closest first)
      .slice(0, limit);

    return NextResponse.json({
      stations: stationsWithDistance,
      userLocation: {
        latitude: lat,
        longitude: lng,
      },
      searchRadius: radius,
      totalFound: stationsWithDistance.length,
    });

  } catch (error) {
    console.error('Error fetching nearby stations:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch nearby stations' },
      { status: 500 }
    );
  }
}