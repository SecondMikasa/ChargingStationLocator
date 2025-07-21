'use client';

import { QueueStatusDemo } from '@/components/stations/queue-status-demo';

export default function TestQueueIndicatorPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Queue Status Indicator Test</h1>
      <QueueStatusDemo />
    </div>
  );
}