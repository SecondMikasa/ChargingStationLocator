'use client';

import { ActiveSessionsCard } from './active-sessions-card';
import { useActiveSessions } from '@/hooks/use-active-sessions';

export function ActiveSessionsExample() {
  const { 
    sessions, 
    isLoading, 
    error, 
    completeSession 
  } = useActiveSessions();

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <ActiveSessionsCard
        sessions={sessions}
        isLoading={isLoading}
        onCompleteSession={completeSession}
      />
    </div>
  );
}