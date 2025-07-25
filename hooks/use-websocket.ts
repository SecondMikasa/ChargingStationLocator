'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// WebSocket message types
interface QueueUpdateMessage {
  type: 'QUEUE_UPDATE';
  stationId: string;
  newQueueLength: number;
  timestamp: string;
  updatedBy?: string;
}

interface UserNotificationMessage {
  type: 'USER_NOTIFICATION';
  userId: string;
  sessionId?: string;
  notificationType: 'position_update' | 'next_in_line' | 'station_available';
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface ConnectionMessage {
  type: 'CONNECTION_ESTABLISHED' | 'HEARTBEAT_ACK' | 'SUBSCRIPTION_CONFIRMED' | 'UNSUBSCRIPTION_CONFIRMED' | 'AUTHENTICATION_SUCCESS' | 'ERROR';
  stationId?: string;
  userId?: string;
  message?: string;
  timestamp: string;
}

type WebSocketMessage = QueueUpdateMessage | UserNotificationMessage | ConnectionMessage;

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  subscribeToStation: (stationId: string) => void;
  unsubscribeFromStation: (stationId: string) => void;
  onQueueUpdate: (callback: (update: QueueUpdateMessage) => void) => void;
  onUserNotification: (callback: (notification: UserNotificationMessage) => void) => void;
  subscribedStations: Set<string>;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000
  } = options;

  const { data: session } = useSession();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const wsEndpointRef = useRef<string | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribedStations, setSubscribedStations] = useState<Set<string>>(new Set());

  // Callback refs for event handlers
  const queueUpdateCallbackRef = useRef<((update: QueueUpdateMessage) => void) | null>(null);
  const userNotificationCallbackRef = useRef<((notification: UserNotificationMessage) => void) | null>(null);

  // Fetch WebSocket endpoint from API
  const fetchWebSocketEndpoint = useCallback(async () => {
    try {
      const response = await fetch('/api/ws/queue-updates');
      if (!response.ok) {
        throw new Error('Failed to get WebSocket endpoint');
      }

      const data = await response.json();
      return data.wsEndpoint || null;
    } catch (error) {
      console.error('Error fetching WebSocket endpoint:', error);
      return null;
    }
  }, []);

  // Send heartbeat to keep connection alive
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'HEARTBEAT'
      }));
    }
  }, []);

  // Start heartbeat mechanism
  const startHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
    }

    heartbeatTimeoutRef.current = setInterval(sendHeartbeat, heartbeatInterval);
  }, [sendHeartbeat, heartbeatInterval]);

  // Stop heartbeat mechanism
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  // Handle WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'CONNECTION_ESTABLISHED':
          console.log('WebSocket connection established');
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
          reconnectAttemptsRef.current = 0;

          // Authenticate if user is logged in
          if (session?.user?.id && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'AUTHENTICATE',
              userId: session.user.id
            }));
          }
          break;

        case 'HEARTBEAT_ACK':
          // Heartbeat acknowledged, connection is healthy
          break;

        case 'QUEUE_UPDATE':
          if (queueUpdateCallbackRef.current) {
            queueUpdateCallbackRef.current(message as QueueUpdateMessage);
          }
          break;

        case 'USER_NOTIFICATION':
          if (userNotificationCallbackRef.current) {
            userNotificationCallbackRef.current(message as UserNotificationMessage);
          }
          break;

        case 'AUTHENTICATION_SUCCESS':
          console.log('WebSocket authentication successful');

          // Resubscribe to stations after authentication
          subscribedStations.forEach(stationId => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'SUBSCRIBE_STATION',
                stationId
              }));
            }
          });
          break;

        case 'SUBSCRIPTION_CONFIRMED':
          if (message.stationId) {
            setSubscribedStations(prev => new Set(prev).add(message.stationId!));
            console.log(`Subscribed to station ${message.stationId}`);
          }
          break;

        case 'UNSUBSCRIPTION_CONFIRMED':
          if (message.stationId) {
            setSubscribedStations(prev => {
              const newSet = new Set(prev);
              newSet.delete(message.stationId!);
              return newSet;
            });
            console.log(`Unsubscribed from station ${message.stationId}`);
          }
          break;

        case 'ERROR':
          console.error('WebSocket error:', message.message);
          setError(message.message || 'Unknown WebSocket error');
          break;

        default:
          console.warn('Unknown WebSocket message type:', message);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [session?.user?.id, subscribedStations]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    if (isConnecting) {
      return; // Already connecting
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Get WebSocket endpoint from API if not already cached
      if (!wsEndpointRef.current) {
        wsEndpointRef.current = await fetchWebSocketEndpoint();

        if (!wsEndpointRef.current) {
          throw new Error('Failed to get WebSocket endpoint');
        }
      }

      console.log(`Connecting to WebSocket at ${wsEndpointRef.current}`);
      wsRef.current = new WebSocket(wsEndpointRef.current);

      wsRef.current.onopen = () => {
        console.log('WebSocket connection opened');
        startHeartbeat();
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        stopHeartbeat();

        // Handle errors based on close code
        if (event.code !== 1000) { // 1000 = normal closure
          const errorMessage = event.reason || `Connection closed with code ${event.code}`;
          console.error('WebSocket error:', errorMessage);
          setError(errorMessage);
        }

        // Attempt reconnect
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError('Maximum reconnection attempts reached');
        }
      };


    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setError('Failed to create WebSocket connection');
      setIsConnecting(false);
    }
  }, [isConnecting, fetchWebSocketEndpoint, handleMessage, startHeartbeat, stopHeartbeat, maxReconnectAttempts, reconnectInterval]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    stopHeartbeat();

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    setSubscribedStations(new Set());
    reconnectAttemptsRef.current = 0;
  }, [stopHeartbeat]);

  // Subscribe to station updates
  const subscribeToStation = useCallback((stationId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log(`Subscribing to station ${stationId}`);
      wsRef.current.send(JSON.stringify({
        type: 'SUBSCRIBE_STATION',
        stationId
      }));
    } else {
      // Store subscription intent to resubscribe when connection is established
      setSubscribedStations(prev => new Set(prev).add(stationId));

      // If not connected, try to connect
      if (!isConnected && !isConnecting) {
        connect();
      }
    }
  }, [isConnected, isConnecting, connect]);

  // Unsubscribe from station updates
  const unsubscribeFromStation = useCallback((stationId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log(`Unsubscribing from station ${stationId}`);
      wsRef.current.send(JSON.stringify({
        type: 'UNSUBSCRIBE_STATION',
        stationId
      }));
    }

    // Remove from local subscriptions regardless of connection state
    setSubscribedStations(prev => {
      const newSet = new Set(prev);
      newSet.delete(stationId);
      return newSet;
    });
  }, []);

  // Set queue update callback
  const onQueueUpdate = useCallback((callback: (update: QueueUpdateMessage) => void) => {
    queueUpdateCallbackRef.current = callback;
  }, []);

  // Set user notification callback
  const onUserNotification = useCallback((callback: (notification: UserNotificationMessage) => void) => {
    userNotificationCallbackRef.current = callback;
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]); // Remove connect and disconnect from dependencies

  // Re-authenticate when session changes
  useEffect(() => {
    if (isConnected && session?.user?.id && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'AUTHENTICATE',
        userId: session.user.id
      }));
    }
  }, [isConnected, session?.user?.id]);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    subscribeToStation,
    unsubscribeFromStation,
    onQueueUpdate,
    onUserNotification,
    subscribedStations
  };
}