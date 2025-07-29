import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-utils';
import connectDB from '@/lib/mongodb';
import ChargingStation from '@/models/ChargingStation';
import { z } from 'zod';
import { Types } from 'mongoose';

// Validation schema for station updates (all fields optional)
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

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

// PUT /api/admin/stations/[id] - Update station
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication
    await requireAdmin();
    
    await connectDB();
    
    const { id } = await params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid station ID format' },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    
    // Validate request data
    const validatedData = UpdateStationSchema.parse(body);
    
    // Check if station exists
    const existingStation = await ChargingStation.findById(id);
    if (!existingStation) {
      return NextResponse.json(
        { success: false, error: 'Station not found' },
        { status: 404 }
      );
    }
    
    // Update station
    const updatedStation = await ChargingStation.findByIdAndUpdate(
      id,
      { ...validatedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      station: {
        id: updatedStation._id.toString(),
        name: updatedStation.name,
        latitude: updatedStation.latitude,
        longitude: updatedStation.longitude,
        pricePerKwh: updatedStation.pricePerKwh,
        queueLength: updatedStation.queueLength,
        amenities: updatedStation.amenities,
        operatingHours: updatedStation.operatingHours,
        createdAt: updatedStation.createdAt,
        updatedAt: updatedStation.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Error updating station:', error);
    
    if (error instanceof Error && (error.message === 'Authentication required' || error.message === 'Admin access required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Authentication required' ? 401 : 403 }
      );
    }
    
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
}

// DELETE /api/admin/stations/[id] - Delete station
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication
    await requireAdmin();
    
    await connectDB();
    
    const { id } = await params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid station ID format' },
        { status: 400 }
      );
    }
    
    // Check if station exists
    const existingStation = await ChargingStation.findById(id);
    if (!existingStation) {
      return NextResponse.json(
        { success: false, error: 'Station not found' },
        { status: 404 }
      );
    }
    
    // Delete station
    await ChargingStation.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Station deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting station:', error);
    
    if (error instanceof Error && (error.message === 'Authentication required' || error.message === 'Admin access required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Authentication required' ? 401 : 403 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete station' },
      { status: 500 }
    );
  }
}

// GET /api/admin/stations/[id] - Get single station (optional, for completeness)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check admin authentication
    await requireAdmin();
    
    await connectDB();
    
    const { id } = await params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid station ID format' },
        { status: 400 }
      );
    }
    
    // Find station
    const station = await ChargingStation.findById(id);
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
    console.error('Error fetching station:', error);
    
    if (error instanceof Error && (error.message === 'Authentication required' || error.message === 'Admin access required')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.message === 'Authentication required' ? 401 : 403 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch station' },
      { status: 500 }
    );
  }
}