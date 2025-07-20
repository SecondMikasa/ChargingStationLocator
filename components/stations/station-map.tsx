'use client';

import dynamic from 'next/dynamic';
import { ChargingStation } from '@/types/station';
import { Card } from '@/components/ui/card';

// Import the client-side map component with SSR disabled
const StationMapClient = dynamic(
  () => import('./station-map-client').then(mod => ({ default: mod.StationMapClient })),
  { 
    ssr: false,
    loading: () => (
      <Card className="w-full h-[400px] flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </Card>
    )
  }
);

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

export function StationMap(props: StationMapProps) {
  // Simply pass all props to the client-side component
  return <StationMapClient {...props} />;
}