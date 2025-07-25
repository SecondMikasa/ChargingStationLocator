'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { ChargingStation } from '@/types/station';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin, DollarSign, Users, Clock } from 'lucide-react';
import L from 'leaflet';
import { QueueStatusIndicator } from '@/components/stations/queue-status-indicator';
import { useSession } from 'next-auth/react';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet default icon issue in Next.js
const createCustomIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Custom marker icons
const normalIcon = createCustomIcon('#3b82f6'); // blue
const lowQueueIcon = createCustomIcon('#22c55e'); // green
const highQueueIcon = createCustomIcon('#ef4444'); // red
const userLocationIcon = createCustomIcon('#8b5cf6'); // purple

interface StationMapProps {
  stations: ChargingStation[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  loading?: boolean;
  onStationSelect?: (station: ChargingStation) => void;
  onQueueUpdate?: (stationId: string, newQueueLength: number) => void;
}

// Component to update map view when props change
function MapUpdater({ userLocation, stations }: {
  userLocation?: { latitude: number; longitude: number };
  stations: ChargingStation[]
}) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 13);
    } else if (stations.length > 0) {
      // If no user location, center on first station
      map.setView([stations[0].latitude, stations[0].longitude], 13);
    }
  }, [map, userLocation, stations]);

  // Create bounds to fit all markers if we have stations
  useEffect(() => {
    if (stations.length > 0) {
      const bounds = L.latLngBounds(stations.map(station => [station.latitude, station.longitude]));

      // Add user location to bounds if available
      if (userLocation) {
        bounds.extend([userLocation.latitude, userLocation.longitude]);
      }

      // Only fit bounds if we have multiple points or user location + stations
      if (bounds.isValid() && (stations.length > 1 || userLocation)) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, stations, userLocation]);

  return null;
}

export function StationMapClient({ stations, userLocation, loading = false, onStationSelect, onQueueUpdate }: StationMapProps) {
  // Prevent unused parameter warning
  console.debug('Station selection handler:', onStationSelect);
  const [mapReady, setMapReady] = useState(false);
  const [userSessions, setUserSessions] = useState<Record<string, number>>({});
  const { data: session } = useSession();

  // Handle navigation to Google Maps
  const handleNavigate = (station: ChargingStation) => {
    if (!userLocation) {
      // Fallback to just the destination
      const url = `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`;
      window.open(url, '_blank');
      return;
    }

    // Full navigation with origin and destination
    const url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${station.latitude},${station.longitude}`;
    window.open(url, '_blank');
  };

  // Fetch user's active sessions
  useEffect(() => {
    const fetchUserSessions = async () => {
      if (!session?.user) return;
      
      try {
        const response = await fetch('/api/sessions/active');
        if (!response.ok) return;
        
        const data = await response.json();
        
        // Create a map of stationId -> queuePosition
        const sessionMap: Record<string, number> = {};
        
        // Check if data.sessions exists and is an array
        if (data && data.sessions && Array.isArray(data.sessions)) {
          data.sessions.forEach((session: any) => {
            if (session.stationId && session.queuePosition) {
              sessionMap[session.stationId] = session.queuePosition;
            }
          });
        }
        
        setUserSessions(sessionMap);
      } catch (error) {
        console.error('Error fetching user sessions:', error);
      }
    };
    
    fetchUserSessions();
  }, [session]);

  // Handle joining queue
  const handleJoinQueue = async (station: ChargingStation) => {
    try {
      const stationId = station.id || station._id?.toString();
      if (!stationId) {
        alert('Station ID not found');
        return;
      }

      const response = await fetch(`/api/stations/${stationId}/queue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join queue');
      }

      const data = await response.json();
      
      // Update the queue length in the parent component
      if (onQueueUpdate && data.station) {
        onQueueUpdate(stationId, data.station.queueLength);
      }
      
      // Update local user sessions map
      if (data.session) {
        setUserSessions(prev => ({
          ...prev,
          [stationId]: data.session.queuePosition
        }));
      }

      alert(`Successfully joined the queue at ${station.name}! Queue position: ${data.station.queueLength}`);
    } catch (error) {
      console.error('Error joining queue:', error);
      alert('Failed to join queue. Please try again.');
    }
  };

  // Get marker icon based on queue length
  const getMarkerIcon = (queueLength: number) => {
    if (queueLength === 0) return lowQueueIcon;
    if (queueLength > 2) return highQueueIcon;
    return normalIcon;
  };

  // Initialize map when component mounts
  useEffect(() => {
    setMapReady(true);
  }, []);

  if (loading) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </Card>
    );
  }

  // Default center if no user location or stations
  const defaultCenter: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : stations.length > 0
      ? [stations[0].latitude, stations[0].longitude]
      : [28.6139, 77.2090]; // Default to a location if nothing else available

  return (
    <Card className="w-full h-[400px] overflow-hidden relative z-0">
      {mapReady && (
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          attributionControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Update map view when props change */}
          <MapUpdater userLocation={userLocation} stations={stations} />

          {/* User location marker */}
          {userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userLocationIcon}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-medium">Your Location</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Station markers */}
          {stations.map((station) => (
            <Marker
              key={station.id || station._id?.toString()}
              position={[station.latitude, station.longitude]}
              icon={getMarkerIcon(station.queueLength)}
            >
              <Popup maxWidth={300} minWidth={250}>
                <div className="p-3">
                  <h3 className="font-bold text-lg mb-3 text-gray-900">{station.name}</h3>

                  {/* Key metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="font-medium">
                        {station.distance ? `${station.distance} km` : 'Distance N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="font-medium">₹{station.pricePerKwh}/kWh</span>
                    </div>
                  </div>

                  {/* Queue status */}
                  <div className="mb-3">
                    <QueueStatusIndicator 
                      stationId={station.id || station._id?.toString() || ''} 
                      initialQueueLength={station.queueLength}
                      userPosition={userSessions[station.id || station._id?.toString() || '']}
                    />
                  </div>

                  {/* Operating hours */}
                  {station.operatingHours && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>
                        {station.operatingHours.open === '24/7'
                          ? '24/7 Open'
                          : `${station.operatingHours.open} - ${station.operatingHours.close}`
                        }
                      </span>
                    </div>
                  )}

                  {/* Amenities */}
                  {station.amenities && station.amenities.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Amenities:</p>
                      <div className="flex flex-wrap gap-1">
                        {station.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                          >
                            {amenity}
                          </span>
                        ))}
                        {station.amenities.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{station.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleJoinQueue(station)}
                      className="w-full"
                      size="sm"
                      variant="default"
                      disabled={!!userSessions[station.id || station._id?.toString() || '']}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {userSessions[station.id || station._id?.toString() || ''] 
                        ? 'Already in Queue' 
                        : 'Join Queue'}
                    </Button>
                    <Button 
                      onClick={() => handleNavigate(station)}
                      className="w-full"
                      size="sm"
                      variant="outline"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </Card>
  );
}