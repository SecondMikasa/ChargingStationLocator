import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ChargingSession from '@/models/ChargingSession';
import ChargingStation from '@/models/ChargingStation';
import { connectToDatabase } from '@/lib/mongodb';
import { SessionHistoryResponse } from '@/types/queue';

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const skip = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Find completed sessions for the user
    const [sessions, totalCount] = await Promise.all([
      ChargingSession.find({
        userId: session.user.email,
        status: { $in: ['completed', 'cancelled'] }
      })
      .sort({ completedAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
      
      ChargingSession.countDocuments({
        userId: session.user.email,
        status: { $in: ['completed', 'cancelled'] }
      })
    ]);

    // Get station information for sessions
    const stationIds = [...new Set(sessions.map(s => s.stationId))];
    const stations = await ChargingStation.find({
      _id: { $in: stationIds }
    }).lean();

    const stationMap = new Map(stations.map(station => [station._id.toString(), station]));

    // Format sessions with station information
    const formattedSessions = sessions.map(session => ({
      id: session._id.toString(),
      userId: session.userId,
      stationId: session.stationId,
      stationName: stationMap.get(session.stationId)?.name,
      joinedAt: session.joinedAt,
      completedAt: session.completedAt,
      status: session.status,
      queuePosition: session.queuePosition,
      estimatedWaitTime: session.estimatedWaitTime,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));

    const response: SessionHistoryResponse = {
      sessions: formattedSessions,
      pagination: {
        page,
        limit,
        total: totalCount,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching session history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session history' },
      { status: 500 }
    );
  }
}