'use client';

import { useState, useEffect } from 'react';
import { StationMap } from '@/components/stations/station-map';
import { StationList } from '@/components/stations/station-list';
import { ChargingStation } from '@/types/station';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, AlertCircle, RefreshCw, Sliders } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function StationsPage() {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Filter settings
  const [radius, setRadius] = useState(100); // Increased default radius
  const [limit, setLimit] = useState(20);
  const [refreshing, setRefreshing] = useState(false);

  // Load stations with user location
  const fetchStations = async (location: { latitude: number; longitude: number }) => {
    try {
      setRefreshing(true);
      setError(null); // Clear previous errors

      console.log('Fetching stations for location:', location, 'radius:', radius, 'limit:', limit);

      // Fetch nearby stations from API
      const response = await fetch(
        `/api/stations/nearby?lat=${location.latitude}&lng=${location.longitude}&radius=${radius}&limit=${limit}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('API response:', data);

      setStations(data.stations || []);
      setUserLocation(data.userLocation);
      setLoading(false);
      setRefreshing(false);

      if (data.stations && data.stations.length === 0) {
        setError(`No charging stations found within ${radius}km of your location. Try increasing the search radius.`);
      }
    } catch (err) {
      console.error('Error fetching stations:', err);
      setError(`Failed to fetch nearby stations: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Default location (Delhi, India - Connaught Place)
  const defaultLocation = {
    latitude: 28.6139,
    longitude: 77.2090
  };

  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(userLoc);
          setLocationPermission('granted');
          setError(null); // Clear any previous errors
          fetchStations(userLoc);
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Could not get your location. Using default location (Delhi, India).');
          setLocationPermission('denied');

          // Fallback to default location
          setUserLocation(defaultLocation);
          fetchStations(defaultLocation);
        },
        {
          timeout: 10000, // 10 second timeout
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Using default location (Delhi, India).');
      setLocationPermission('denied');

      // Fallback to default location
      setUserLocation(defaultLocation);
      fetchStations(defaultLocation);
    }
  };

  // Initial load
  useEffect(() => {
    getUserLocation();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    if (userLocation) {
      fetchStations(userLocation);
    } else {
      // Use default location if no user location is available
      setUserLocation(defaultLocation);
      fetchStations(defaultLocation);
    }
  };

  // Handle filter apply
  const handleApplyFilters = () => {
    const locationToUse = userLocation || defaultLocation;
    if (!userLocation) {
      setUserLocation(defaultLocation);
    }
    fetchStations(locationToUse);
  };

  const handleStationSelect = (station: ChargingStation) => {
    // Log the selected station for debugging
    console.log('Selected station:', station);
    
    // Don't automatically switch to list view - let the popup show instead
    // The user can manually switch to list view if they want to see more details
  };

  const handleQueueUpdate = (stationId: string, newQueueLength: number) => {
    // Update the stations array with the new queue length
    setStations(prevStations => 
      prevStations.map(station => {
        const currentStationId = station.id || station._id?.toString();
        if (currentStationId === stationId) {
          return { ...station, queueLength: newQueueLength };
        }
        return station;
      })
    );
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nearby Charging Stations</h1>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Sliders className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent className="z-[9999]">
              <SheetHeader>
                <SheetTitle>Search Filters</SheetTitle>
                <SheetDescription>
                  Adjust your search parameters for charging stations
                </SheetDescription>
              </SheetHeader>

              <div className="py-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="radius">Search Radius: {radius} km</Label>
                  <Slider
                    id="radius"
                    min={5}
                    max={100}
                    step={5}
                    value={[radius]}
                    onValueChange={(value) => setRadius(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limit">Maximum Results</Label>
                  <Input
                    id="limit"
                    type="number"
                    min={5}
                    max={50}
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value) || 20)}
                  />
                </div>

                {locationPermission === 'denied' && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Location Access Denied</AlertTitle>
                    <AlertDescription>
                      Please enable location access in your browser settings to get the most accurate results.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <SheetFooter>
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {userLocation && !loading && (
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            Using location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </span>
        </div>
      )}

      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <StationList
            stations={stations}
            userLocation={userLocation}
            loading={loading || refreshing}
            onQueueUpdate={handleQueueUpdate}
          />
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <StationMap
                stations={stations}
                userLocation={userLocation}
                loading={loading || refreshing}
                onStationSelect={handleStationSelect}
                onQueueUpdate={handleQueueUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}