'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, AlertCircle } from 'lucide-react';
import { useWebSocket } from '@/hooks/use-websocket';
import { formatDistanceToNow } from 'date-fns';

interface QueueStatusIndicatorProps {
  stationId: string;
  initialQueueLength: number;
  userPosition?: number;
  className?: string;
}

export function QueueStatusIndicator({ 
  stationId, 
  initialQueueLength, 
  userPosition, 
  className 
}: QueueStatusIndicatorProps) {
  const [queueLength, setQueueLength] = useState(initialQueueLength);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    subscribeToStation, 
    unsubscribeFromStation, 
    onQueueUpdate, 
    isConnected 
  } = useWebSocket({
    autoConnect: true
  });

  // Subscribe to station updates when component mounts
  useEffect(() => {
    if (isConnected && stationId) {
      subscribeToStation(stationId);
      setIsSubscribed(true);
    }
  }, [isConnected, stationId, subscribeToStation]);

  // Handle queue updates from WebSocket
  useEffect(() => {
    const handleQueueUpdate = (update: any) => {
      if (update.stationId === stationId) {
        setQueueLength(update.newQueueLength);
        setLastUpdated(new Date(update.timestamp));
      }
    };

    onQueueUpdate(handleQueueUpdate);

    return () => {
      // Cleanup subscription when component unmounts
      if (isSubscribed && stationId) {
        unsubscribeFromStation(stationId);
      }
    };
  }, [stationId, onQueueUpdate, unsubscribeFromStation, isSubscribed]);

  // Get queue status color
  const getQueueStatusColor = (length: number) => {
    if (length === 0) return 'bg-green-100 text-green-800';
    if (length <= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Get queue status text
  const getQueueStatusText = (length: number) => {
    if (length === 0) return 'Available Now';
    if (length === 1) return '1 in queue';
    return `${length} in queue`;
  };

  // Format last updated time
  const getLastUpdatedText = () => {
    try {
      return `Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}`;
    } catch (err) {
      return 'Just updated';
    }
  };

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-500 text-sm ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <span>Error loading queue status</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <Badge 
        variant="secondary" 
        className={`${getQueueStatusColor(queueLength)} mb-1`}
      >
        <Users className="h-3 w-3 mr-1" />
        {getQueueStatusText(queueLength)}
      </Badge>
      
      {userPosition && (
        <div className="text-xs font-medium mb-1">
          {userPosition === 1 ? (
            <span className="text-green-600">You're next!</span>
          ) : (
            <span>Your position: {userPosition}</span>
          )}
        </div>
      )}
      
      <div className="flex items-center text-xs text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        <span>{getLastUpdatedText()}</span>
      </div>
    </div>
  );
}