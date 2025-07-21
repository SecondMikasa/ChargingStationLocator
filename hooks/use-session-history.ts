import { useState, useEffect } from 'react';
import { ChargingSession, SessionHistoryResponse } from '@/types/queue';

interface UseSessionHistoryOptions {
  initialPage?: number;
  pageSize?: number;
}

export function useSessionHistory({ initialPage = 1, pageSize = 5 }: UseSessionHistoryOptions = {}) {
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: pageSize,
    total: 0,
  });

  // Fetch session history
  const fetchSessionHistory = async (page = pagination.page, limit = pagination.limit) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/sessions/history?page=${page}&limit=${limit}`);
      
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

  // Change page
  const goToPage = (page: number) => {
    if (page < 1 || page > Math.ceil(pagination.total / pagination.limit)) {
      return;
    }
    
    fetchSessionHistory(page, pagination.limit);
  };

  // Fetch sessions on component mount
  useEffect(() => {
    fetchSessionHistory();
  }, []);

  return {
    sessions,
    isLoading,
    error,
    pagination,
    fetchSessionHistory,
    goToPage,
  };
}