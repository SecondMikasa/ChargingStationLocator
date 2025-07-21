'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { ChargingSession } from '@/types/queue';
import { Clock, Zap, MapPin, Timer, CheckCircle } from 'lucide-react';

interface ActiveSessionsCardProps {
  sessions: ChargingSession[];
  isLoading?: boolean;
  onCompleteSession: (sessionId: string, stationId: string) => Promise<void>;
}

export function ActiveSessionsCard({ 
  sessions, 
  isLoading = false, 
  onCompleteSession 
}: ActiveSessionsCardProps) {
  const [completingSession, setCompletingSession] = useState<string | null>(null);
  const [sessionToConfirm, setSessionToConfirm] = useState<ChargingSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle session completion confirmation
  const handleConfirmComplete = async () => {
    if (!sessionToConfirm) return;
    
    try {
      setIsSubmitting(true);
      setCompletingSession(sessionToConfirm.id);
      
      await onCompleteSession(sessionToConfirm.id, sessionToConfirm.stationId);
      
      // Reset states after completion
      setSessionToConfirm(null);
    } catch (error) {
      console.error('Error completing session:', error);
    } finally {
      setIsSubmitting(false);
      setCompletingSession(null);
    }
  };

  // Format wait time to display
  const formatWaitTime = (minutes?: number): string => {
    if (minutes === undefined || minutes === null) return 'Unknown';
    if (minutes === 0) return 'No wait';
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}m` 
        : `${hours}h`;
    }
  };

  // Format date to display
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get queue position badge color
  const getPositionBadgeColor = (position: number): string => {
    if (position === 1) return 'bg-green-100 text-green-800';
    if (position <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Active Charging Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-pulse flex flex-col w-full gap-4" data-testid="loading-indicator">
                <div className="h-20 bg-gray-200 rounded-md w-full"></div>
                <div className="h-20 bg-gray-200 rounded-md w-full"></div>
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <div className="mb-2">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <p className="text-lg font-medium">No active charging sessions</p>
              <p className="text-sm mt-1">
                Join a queue at a charging station to start charging
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div 
                  key={session.id} 
                  className="border rounded-lg p-4 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{session.stationName}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Joined {formatDate(session.joinedAt)}</span>
                      </div>
                    </div>
                    <Badge 
                      className={getPositionBadgeColor(session.queuePosition)}
                    >
                      {session.queuePosition === 1 
                        ? "You're next!" 
                        : `Position ${session.queuePosition}`}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>Station #{session.stationId.slice(-4)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Timer className="h-4 w-4 text-gray-500" />
                      <span>
                        Wait: {formatWaitTime(session.estimatedWaitTime)}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setSessionToConfirm(session)}
                    disabled={isSubmitting || completingSession === session.id}
                    className="w-full mt-2"
                    variant={session.queuePosition === 1 ? "default" : "secondary"}
                  >
                    {isSubmitting && completingSession === session.id ? (
                      <>
                        <span className="animate-spin mr-1">⚪</span>
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete Charging
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!sessionToConfirm} onOpenChange={(open) => !open && setSessionToConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Charging Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to complete your charging session at{' '}
              <span className="font-medium">{sessionToConfirm?.stationName}</span>?
              This will remove you from the queue and update the wait time for other users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmComplete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Completing...' : 'Complete Session'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}