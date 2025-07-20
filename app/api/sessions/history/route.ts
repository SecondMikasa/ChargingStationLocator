import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import connectDB from '@/lib/mongodb';
import ChargingSession from '@/models/ChargingSession';
import ChargingStation from '@/models/ChargingStation';
import { SessionHistoryResponse } from '@/types/queue';
import { formatSessionForResponse, validatePagination } from '@/lib/session-utils';

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get the session to validate user authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized. Please log in to view session history.',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Validate pagination parameters
    const paginationValidation = validatePagination(page, limit);
    if (!paginationValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: paginationValidation.error,
          code: 'INVALID_PAGINATION'
        },
        { status: 400 }
      );
    }

    const normalizedPage = paginationValidation.normalizedPage;
    const normalizedLimit = paginationValidation.normalizedLimit;
    const skip = (normalizedPage - 1) * normalizedLimit;

    // Get total count of completed sessions for pagination
    const totalSessions = await ChargingSession.countDocuments({
      userId: session.user.id,
      status: 'completed'
    });

    // Find completed charging sessions for the user with pagination
    const completedSessions = await ChargingSession.find({
      userId: session.user.id,
      status: 'completed'
    })
    .sort({ completedAt: -1 }) // Most recent first
    .skip(skip)
    .limit(normalizedLimit);

    // Get station details for each session
    const sessionsWithStationInfo = await Promise.all(
      completedSessions.map(async (chargingSession) => {
        const station = await ChargingStation.findById(chargingSession.stationId);
        return formatSessionForResponse(chargingSession, station?.name);
      })
    );

    const response: SessionHistoryResponse = {
      sessions: sessionsWithStationInfo,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total: totalSessions
      }
    };

    return NextResponse.json({
      success: true,
      ...response
    });

  } catch (error) {
    console.error('Error fetching session history:', error);
    
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