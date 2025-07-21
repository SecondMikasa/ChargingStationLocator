'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChargingSession } from '@/types/queue';
import { Clock, Zap, MapPin, Timer, History, ChevronLeft, ChevronRight } from 'lucide-react';

interface SessionHistoryCardProps {
  sessions: ChargingSession[];
  isLoading?: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  onPageChange: (page: number) => void;
}

export function SessionHistoryCard({ 
  sessions, 
  isLoading = false, 
  pagination,
  onPageChange
}: SessionHistoryCardProps) {
  // Format date to display
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate session duration
  const calculateDuration = (joinedAt: Date, completedAt?: Date): string => {
    if (!completedAt) return 'Unknown';
    
    const start = new Date(joinedAt);
    const end = new Date(completedAt);
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    
    if (durationMinutes < 60) {
      return `${durationMinutes} min`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const remainingMinutes = durationMinutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}m` 
        : `${hours}h`;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate pagination info
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const hasNextPage = pagination.page < totalPages;
  const hasPrevPage = pagination.page > 1;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-purple-500" />
          Charging Session History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-pulse flex flex-col w-full gap-4" data-testid="loading-indicator">
              <div className="h-20 bg-gray-200 rounded-md w-full"></div>
              <div className="h-20 bg-gray-200 rounded-md w-full"></div>
              <div className="h-20 bg-gray-200 rounded-md w-full"></div>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <div className="mb-2">
              <History className="h-12 w-12 mx-auto text-gray-400" />
            </div>
            <p className="text-lg font-medium">No charging session history</p>
            <p className="text-sm mt-1">
              Your completed charging sessions will appear here
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div 
                  key={session.id} 
                  className="border rounded-lg p-4 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{session.stationName || `Station #${session.stationId.slice(-4)}`}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Completed {formatDate(session.completedAt || session.updatedAt)}</span>
                      </div>
                    </div>
                    <Badge 
                      className={getStatusBadgeColor(session.status)}
                    >
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
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
                        Duration: {calculateDuration(session.joinedAt, session.completedAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 pt-2 border-t">
                    Started: {formatDate(session.joinedAt)}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} sessions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={!hasPrevPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {pagination.page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={!hasNextPage}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}