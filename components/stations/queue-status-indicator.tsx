'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebSocket } from '@/hooks/use-websocket';
import { formatDate } from '@/lib/utils';

interface QueueStatusIndicatorProps {
    stationId: string;
    initialQueueLength: number;
    userPosition?: number;
    className?: string;
    lastUpdated?: Date;
}

interface GetQueueStatusType {
    label: 'Available Now' | 'Low Wait' | 'High Wait';
    variant: 'default' | 'secondary' | 'destructive';
    icon: React.ReactElement;
}

export function QueueStatusIndicator({
    stationId,
    initialQueueLength,
    userPosition,
    className,
    lastUpdated = new Date(),
}: QueueStatusIndicatorProps) {
    const [queueLength, setQueueLength] = useState(initialQueueLength);
    const [lastUpdateTime, setLastUpdateTime] = useState<Date>(lastUpdated);

    // Connect to WebSocket for real-time updates
    const {
        isConnected,
        subscribeToStation,
        unsubscribeFromStation,
        onQueueUpdate,
    } = useWebSocket({
        autoConnect: true,
    });

    // Subscribe to station updates when component mounts
    useEffect(() => {
        if (stationId) {
            subscribeToStation(stationId);

            // Cleanup: unsubscribe when component unmounts
            return () => {
                unsubscribeFromStation(stationId);
            };
        }
    }, [stationId, subscribeToStation, unsubscribeFromStation]);

    // Handle queue updates from WebSocket
    useEffect(() => {
        onQueueUpdate((update) => {
            if (update.stationId === stationId) {
                setQueueLength(update.newQueueLength);
                setLastUpdateTime(new Date(update.timestamp));
            }
        });
    }, [stationId, onQueueUpdate]);

    // Determine queue status for visual indicator
    const getQueueStatus = (): GetQueueStatusType => {
        if (queueLength === 0) {
            return {
                label: 'Available Now',
                variant: 'default', // green
                icon: <CheckCircle className="h-4 w-4" />,
            };
        } else if (queueLength <= 3) {
            return {
                label: 'Low Wait',
                variant: 'secondary', // yellow/amber
                icon: <Clock className="h-4 w-4" />,
            };
        } else {
            return {
                label: 'High Wait',
                variant: 'destructive', // red
                icon: <AlertCircle className="h-4 w-4" />,
            };
        }
    };

    const queueStatus = getQueueStatus();

    return (
        <Card className={cn("w-full", className)}>
            <CardContent className="p-4">
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Queue Status</span>
                        </div>
                        <Badge variant={queueStatus.variant} className="flex items-center space-x-1">
                            {queueStatus.icon}
                            <span>{queueStatus.label}</span>
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                            {queueLength} {queueLength === 1 ? 'person' : 'people'} in queue
                        </div>
                    </div>

                    {userPosition !== undefined && (
                        <div className="mt-2 flex items-center space-x-2">
                            <Badge variant="outline" className="bg-primary/10">
                                Your position: {userPosition}
                            </Badge>
                            {userPosition === 1 && (
                                <Badge variant="default" className="animate-pulse">
                                    You're next!
                                </Badge>
                            )}
                        </div>
                    )}

                    <div className="mt-1 text-xs text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        Last updated: {formatDate(lastUpdateTime)}
                    </div>

                    {!isConnected && (
                        <div className="mt-1 text-xs text-destructive flex items-center">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Offline - updates paused
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}