'use client';

import { useState, useEffect } from 'react';
import { QueueStatusIndicator } from './queue-status-indicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export function QueueStatusDemo() {
  const [stationId, setStationId] = useState('demo-station-1');
  const [queueLength, setQueueLength] = useState(3);
  const [userPosition, setUserPosition] = useState<number | undefined>(2);
  const [showUserPosition, setShowUserPosition] = useState(true);
  
  // Function to simulate a queue update
  const simulateQueueUpdate = () => {
    // Simulate a WebSocket message by directly updating the component
    const newQueueLength = Math.max(0, queueLength - 1);
    setQueueLength(newQueueLength);
    
    // Update user position if it's being shown
    if (showUserPosition && userPosition && userPosition > 1) {
      setUserPosition(userPosition - 1);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Queue Status Indicator Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="font-medium">Queue Length</div>
            <div className="flex items-center space-x-4">
              <Slider
                value={[queueLength]}
                min={0}
                max={10}
                step={1}
                onValueChange={(value) => setQueueLength(value[0])}
                className="w-full"
              />
              <span className="w-8 text-center">{queueLength}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button onClick={simulateQueueUpdate}>
              Simulate Queue Reduction
            </Button>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show-position"
                checked={showUserPosition}
                onChange={(e) => {
                  setShowUserPosition(e.target.checked);
                  if (!e.target.checked) {
                    setUserPosition(undefined);
                  } else {
                    setUserPosition(Math.min(queueLength, 2));
                  }
                }}
              />
              <label htmlFor="show-position">Show User Position</label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <QueueStatusIndicator
        stationId={stationId}
        initialQueueLength={queueLength}
        userPosition={showUserPosition ? userPosition : undefined}
        lastUpdated={new Date()}
      />
    </div>
  );
}