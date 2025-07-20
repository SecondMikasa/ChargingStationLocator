'use client';

import { useState, useMemo } from 'react';
import { ChargingStation } from '@/types/station';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, DollarSign, Users, Navigation, Wifi, Coffee, Car, ShoppingBag, Fuel, Zap } from 'lucide-react';

interface StationListProps {
  stations: ChargingStation[];
  loading?: boolean;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  onQueueUpdate?: (stationId: string, newQueueLength: number) => void;
}

type SortOption = 'distance' | 'price' | 'queue';

export function StationList({ stations, loading = false, userLocation, onQueueUpdate }: StationListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('distance');

  // Sort stations based on selected option
  const sortedStations = useMemo(() => {
    const stationsCopy = [...stations];
    
    switch (sortBy) {
      case 'distance':
        return stationsCopy.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      case 'price':
        return stationsCopy.sort((a, b) => a.pricePerKwh - b.pricePerKwh);
      case 'queue':
        return stationsCopy.sort((a, b) => a.queueLength - b.queueLength);
      default:
        return stationsCopy;
    }
  }, [stations, sortBy]);

  // Get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'WiFi': <Wifi className="h-3 w-3" />,
      'Cafe': <Coffee className="h-3 w-3" />,
      'Restroom': <Car className="h-3 w-3" />,
      'Parking': <Car className="h-3 w-3" />,
      'Shopping': <ShoppingBag className="h-3 w-3" />,
      'Fuel Station': <Fuel className="h-3 w-3" />,
      'Solar Powered': <Zap className="h-3 w-3" />,
      'ATM': <DollarSign className="h-3 w-3" />,
      'Metro Access': <Car className="h-3 w-3" />,
      'Food Court': <Coffee className="h-3 w-3" />,
      'Vending Machine': <ShoppingBag className="h-3 w-3" />
    };
    return iconMap[amenity] || <Car className="h-3 w-3" />;
  };

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

      alert(`Successfully joined the queue at ${station.name}! Queue position: ${data.station.queueLength}`);
    } catch (error) {
      console.error('Error joining queue:', error);
      alert('Failed to join queue. Please try again.');
    }
  };

  // Get queue status color
  const getQueueStatusColor = (queueLength: number) => {
    if (queueLength === 0) return 'bg-green-100 text-green-800';
    if (queueLength <= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Nearby Charging Stations</h2>
          <div className="w-32 h-10 bg-gray-200 animate-pulse rounded"></div>
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No charging stations found</h3>
        <p className="text-gray-500">Try expanding your search radius or check your location.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with sorting */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Nearby Charging Stations ({stations.length})
        </h2>
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">Distance</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="queue">Queue Length</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Station list */}
      <div className="space-y-4">
        {sortedStations.map((station) => (
          <Card key={station.id || station._id?.toString()} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{station.name}</CardTitle>
                <Badge 
                  variant="secondary" 
                  className={getQueueStatusColor(station.queueLength)}
                >
                  {station.queueLength === 0 ? 'Available' : `${station.queueLength} in queue`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key metrics */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">
                    {station.distance ? `${station.distance} km` : 'Distance N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">₹{station.pricePerKwh}/kWh</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">
                    {station.queueLength === 0 ? 'No wait' : `${station.queueLength} waiting`}
                  </span>
                </div>
              </div>

              {/* Operating hours */}
              {station.operatingHours && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
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
                <div className="flex flex-wrap gap-2">
                  {station.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      <span className="flex items-center gap-1">
                        {getAmenityIcon(amenity)}
                        {amenity}
                      </span>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-2 space-y-2">
                <Button 
                  onClick={() => handleJoinQueue(station)}
                  className="w-full"
                  variant="default"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Join Queue
                </Button>
                <Button 
                  onClick={() => handleNavigate(station)}
                  className="w-full"
                  variant="outline"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}