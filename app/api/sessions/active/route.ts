import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import connectDB from '@/lib/mongodb';
import ChargingSession from '@/models/ChargingSession';
import ChargingStation from '@/models/ChargingStation';
import { ActiveSessionsResponse } from '@/types/queue';
import { formatSessionForResponse } from '@/lib/session-utils';

export async function GET() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get the session to validate user authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized. Please log in to view active sessions.',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Find all active charging sessions for the user
    const activeSessions = await ChargingSession.find({
      userId: session.user.id,
      status: 'active'
    }).sort({ joinedAt: -1 });

    // Get station details for each session
    const sessionsWithStationInfo = await Promise.all(
      activeSessions.map(async (chargingSession) => {
        const station = await ChargingStation.findById(chargingSession.stationId);
        return formatSessionForResponse(chargingSession, station?.name);
      })
    );

    const response: ActiveSessionsResponse = {
      sessions: sessionsWithStationInfo,
      totalActive: sessionsWithStationInfo.length
    };

    return NextResponse.json({
      success: true,
      ...response
    });

  } catch (error) {
    console.error('Error fetching active sessions:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again later.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}