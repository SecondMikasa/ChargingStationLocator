'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { ChargingSession } from '@/types/queue';
import { useActiveSessions } from '@/hooks/use-active-sessions';
import { formatDate } from '@/lib/utils';

interface ActiveSessionsCardProps {
  className?: string;
}

export function ActiveSessionsCard({ className }: ActiveSessionsCardProps) {
  const { sessions, isLoading, error, completeSession } = useActiveSessions();
  const [sessionToComplete, setSessionToComplete] = useState<ChargingSession | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Handle session completion
  const handleCompleteSession = async () => {
    if (!sessionToComplete) return;
    
    try {
      setIsCompleting(true);
      await completeSession(sessionToComplete.id, sessionToComplete.stationId);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to complete session:', error);
    } finally {
      setIsCompleting(false);
      setSessionToComplete(null);
    }
  };

  // Open confirmation dialog
  const openConfirmDialog = (session: ChargingSession) => {
    setSessionToComplete(session);
    setIsDialogOpen(true);
  };

  // Get queue position badge variant
  const getPositionBadgeVariant = (position: number) => {
    if (position === 1) return 'default';
    if (position <= 3) return 'secondary';
    return 'outline';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Charging Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Error Loading Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Charging Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
              <p>No active charging sessions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div 
                  key={session.id} 
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{session.stationName || `Station ${session.stationId.substring(0, 8)}...`}</h3>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>Joined {formatDate(new Date(session.joinedAt))}</span>
                      </div>
                    </div>
                    <Badge variant={getPositionBadgeVariant(session.queuePosition)}>
                      {session.queuePosition === 1 ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          You're next!
                        </span>
                      ) : (
                        `Position ${session.queuePosition}`
                      )}
                    </Badge>
                  </div>

                  {session.estimatedWaitTime !== undefined && (
                    <div className="text-sm flex items-center gap-1">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span>
                        Est. wait: {session.estimatedWaitTime} {session.estimatedWaitTime === 1 ? 'minute' : 'minutes'}
                      </span>
                    </div>
                  )}

                  <Button 
                    onClick={() => openConfirmDialog(session)}
                    variant="default"
                    className="w-full"
                  >
                    Complete Charging
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Charging Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to complete this charging session? This will remove you from the queue and update the queue count for other users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCompleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCompleteSession}
              disabled={isCompleting}
              className={isCompleting ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isCompleting ? 'Completing...' : 'Complete Session'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}