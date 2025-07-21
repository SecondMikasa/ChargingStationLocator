import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import connectDB from '@/lib/mongodb';
import ChargingSession from '@/models/ChargingSession';
import ChargingStation from '@/models/ChargingStation';
import { CompleteSessionRequest, CompleteSessionResponse } from '@/types/queue';
import { 
  validateSessionCompletion, 
  updateQueuePositions, 
  createQueueAuditRecord,
  formatSessionForResponse 
} from '@/lib/session-utils';
import webSocketService from '@/lib/websocket-service';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get the session to validate user authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized. Please log in to complete charging session.',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body: CompleteSessionRequest = await request.json();
    const { sessionId, stationId } = body;

    // Validate required fields
    if (!sessionId || !stationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session ID and Station ID are required.',
          code: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    // Validate the session completion request
    const validation = await validateSessionCompletion(sessionId, stationId, session.user.id);
    
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          code: validation.code
        },
        { status: validation.code === 'UNAUTHORIZED' ? 403 : 
                  validation.code === 'DUPLICATE_COMPLETION' ? 409 : 404 }
      );
    }

    const { session: chargingSession, station } = validation;

    // Ensure we have valid session and station data
    if (!chargingSession || !station) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid session or station data.',
          code: 'VALIDATION_ERROR'
        },
        { status: 500 }
      );
    }

    // Type assertion since we've validated above
    const validSession = chargingSession;
    const validStation = station;

    // Start a database transaction for data consistency
    const mongoSession = await mongoose.startSession();
    
    try {
      await mongoSession.withTransaction(async () => {
        // Update the charging session to completed
        validSession.status = 'completed';
        validSession.completedAt = new Date();
        await validSession.save({ session: mongoSession });

        // Get previous queue count for audit trail
        const previousQueueLength = validStation.queueLength;

        // Reduce the station's queue count
        validStation.queueLength = Math.max(0, validStation.queueLength - 1);
        await validStation.save({ session: mongoSession });

        // Create audit trail record
        await createQueueAuditRecord(
          stationId,
          previousQueueLength,
          validStation.queueLength,
          session.user.id,
          'session_complete',
          mongoSession
        );

        // Update queue positions for remaining active sessions
        await updateQueuePositions(stationId, validSession.queuePosition, mongoSession);
      });

      // Get the updated session data
      const updatedSession = await ChargingSession.findById(sessionId);
      const updatedStation = await ChargingStation.findById(stationId);

      // Broadcast queue update to WebSocket clients
      webSocketService.broadcastQueueUpdate(
        stationId,
        updatedStation!.queueLength,
        session.user.id
      );

      // Send notification to users in the queue about position changes
      const remainingSessions = await ChargingSession.find({
        stationId: stationId,
        status: 'active'
      }).sort({ queuePosition: 1 });

      // Notify the next person in line if queue is not empty
      if (remainingSessions.length > 0) {
        const nextSession = remainingSessions[0];
        if (nextSession.queuePosition === 1) {
          webSocketService.broadcastUserNotification(nextSession.userId, {
            sessionId: nextSession._id.toString(),
            notificationType: 'next_in_line',
            message: "You're next in line! The charging station will be available soon.",
            priority: 'high'
          });
        }
      }

      // If queue is now empty, broadcast station availability
      if (updatedStation!.queueLength === 0) {
        webSocketService.broadcastQueueUpdate(
          stationId,
          0,
          session.user.id
        );
      }

      const response: CompleteSessionResponse = {
        success: true,
        updatedQueue: {
          stationId: stationId,
          newQueueLength: updatedStation!.queueLength
        },
        session: formatSessionForResponse(updatedSession!, updatedStation?.name)
      };

      return NextResponse.json(response);

    } catch (transactionError: unknown) {
      console.error('Transaction error during session completion:', transactionError);
      throw transactionError;
    } finally {
      await mongoSession.endSession();
    }

  } catch (error) {
    console.error('Error completing charging session:', error);
    
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