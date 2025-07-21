import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChargingStation from '@/models/ChargingStation';
import ChargingSession from '@/models/ChargingSession';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectDB();
    
    const resolvedParams = await params;
    const stationId = resolvedParams.id;
    
    // Find the station and incremen
    const station = await ChargingStation.findByIdAndUpdate(
      stationId,
      { $inc: { queueLength: 1 } },
      { new: true }
    );

    if (!station) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      station: {
        ...station.toObject(),
        id: station._id.toString()
      },
      message: 'Successfully joined the queue'
    });

  } catch (error) {
    console.error('Error joining queue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectDB();
    
    const resolvedParams = await params;
    const stationId = resolvedParams.id;
    
    // Find the station and decrement queue length (but not below 0)
    const station = await ChargingStation.findById(stationId);
    
    if (!station) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      );
    }

    // Only decrement if queue length is greater than 0
    if (station.queueLength > 0) {
      station.queueLength -= 1;
      await station.save();
    }

    return NextResponse.json({
      success: true,
      station: {
        ...station.toObject(),
        id: station._id.toString()
      },
      message: 'Successfully left the queue'
    });

  } catch (error) {
    console.error('Error leaving queue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}