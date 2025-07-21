'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Clock, MapPin, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { ChargingSession, SessionHistoryResponse } from '@/types/queue';
import { formatDate, formatDuration } from '@/lib/utils';

interface SessionHistoryCardProps {
  className?: string;
}

export function SessionHistoryCard({ className }: SessionHistoryCardProps) {
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0
  });

  // Fetch session history
  const fetchSessionHistory = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/sessions/history?page=${page}&limit=${pagination.limit}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch session history');
      }

      const data: SessionHistoryResponse = await response.json();
      setSessions(data.sessions);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching session history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch session history');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate session duration
  const calculateDuration = (joinedAt: Date, completedAt: Date | undefined) => {
    if (!completedAt) return 'N/A';
    
    const start = new Date(joinedAt);
    const end = new Date(completedAt);
    const durationMs = end.getTime() - start.getTime();
    
    return formatDuration(durationMs);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(pagination.total / pagination.limit)) return;
    fetchSessionHistory(newPage);
  };

  // Fetch sessions on component mount
  useEffect(() => {
    fetchSessionHistory();
  }, []);

  if (isLoading && sessions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Charging Session History
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
            Error Loading History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Charging Session History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
            <p>No charging history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{session.stationName || `Station ${session.stationId.substring(0, 8)}...`}</h3>
                  <Badge variant="outline">Completed</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Duration: {calculateDuration(session.joinedAt, session.completedAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>Completed: {session.completedAt ? formatDate(new Date(session.completedAt)) : 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {sessions.length > 0 && (
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit) || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}