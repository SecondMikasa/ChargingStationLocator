'use client';

import { SessionHistoryCard } from './session-history-card';
import { useSessionHistory } from '@/hooks/use-session-history';

export function SessionHistoryExample() {
  const { sessions, isLoading, pagination, goToPage } = useSessionHistory({
    initialPage: 1,
    pageSize: 5,
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <SessionHistoryCard
        sessions={sessions}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={goToPage}
      />
    </div>
  );
}