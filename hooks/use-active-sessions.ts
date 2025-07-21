import { useState, useEffect } from 'react';
import { ChargingSession, ActiveSessionsResponse } from '@/types/queue';

export function useActiveSessions() {
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch active sessions
  const fetchActiveSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/sessions/active');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch active sessions');
      }
      
      const data: ActiveSessionsResponse = await response.json();
      setSessions(data.sessions);
    } catch (err) {
      console.error('Error fetching active sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch active sessions');
    } finally {
      setIsLoading(false);
    }
  };

  // Complete a charging session
  const completeSession = async (sessionId: string, stationId: string) => {
    try {
      setError(null);
      
      const response = await fetch('/api/sessions/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, stationId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete session');
      }
      
      // Remove the completed session from the list
      setSessions((prevSessions) => 
        prevSessions.filter((session) => session.id !== sessionId)
      );
      
      return await response.json();
    } catch (err) {
      console.error('Error completing session:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete session');
      throw err;
    }
  };

  // Fetch sessions on component mount
  useEffect(() => {
    fetchActiveSessions();
  }, []);

  return {
    sessions,
    isLoading,
    error,
    fetchActiveSessions,
    completeSession,
  };
}