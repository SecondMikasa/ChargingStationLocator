import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/admin-utils';
import connectDB from '@/lib/mongodb';
import ChargingStation from '@/models/ChargingStation';
import { z } from 'zod';
import mongoose from 'mongoose';

// Validation schema for station updates
const UpdateStationSchema = z.object({
  name: z.string().min(1, 'Station name is required').trim().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  pricePerKwh: z.number().positive('Price must be positive').optional(),
  queueLength: z.number().int().min(0, 'Queue length cannot be negative').optional(),
  amenities: z.array(z.string()).optional(),
  operatingHours: z.object({
    open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
  }).optional()
});

// PUT /api/admin/stations/[id] - Update station
export const PUT = withAdminAuth(async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    
    const { id } = await context.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid station ID' },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    
    // Validate request data
    const validatedData = UpdateStationSchema.parse(body);
    
    // Update station
    const station = await ChargingStation.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );
    
    if (!station) {
      return NextResponse.json(
        { success: false, error: 'Station not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      station: {
        id: station._id.toString(),
        name: station.name,
        latitude: station.latitude,
        longitude: station.longitude,
        pricePerKwh: station.pricePerKwh,
        queueLength: station.queueLength,
        amenities: station.amenities,
        operatingHours: station.operatingHours,
        createdAt: station.createdAt,
        updatedAt: station.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Error updating station:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.message
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update station' },
      { status: 500 }
    );
  }
});

// DELETE /api/admin/stations/[id] - Delete station
export const DELETE = withAdminAuth(async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    
    const { id } = await context.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid station ID' },
        { status: 400 }
      );
    }
    
    // Delete station
    const station = await ChargingStation.findByIdAndDelete(id);
    
    if (!station) {
      return NextResponse.json(
        { success: false, error: 'Station not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Station deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting station:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete station' },
      { status: 500 }
    );
  }
});