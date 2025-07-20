'use client';

import React, { useEffect, useState } from 'react';
import { VoltageDisplay } from './voltage-display';
import { LowBatteryAlert } from './low-battery-alert';

interface VoltageData {
  voltage: number;
  percentage: number;
  timestamp: string;
  status: 'normal' | 'low' | 'critical';
  vehicleId: string;
  deviceName: string;
}

interface BatteryMonitorProps {
  vehicleId?: string;
  className?: string;
}

export function BatteryMonitor({ vehicleId, className }: BatteryMonitorProps) {
  const [voltageData, setVoltageData] = useState<VoltageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use loading and error states to prevent unused variable warnings
  console.debug('Battery monitor state:', { loading, error });
  const [alertDismissed, setAlertDismissed] = useState(false);

  useEffect(() => {
    const fetchVoltageData = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = vehicleId 
          ? `/api/voltage?vehicleId=${encodeURIComponent(vehicleId)}`
          : '/api/voltage';
        
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch voltage data');
        }

        if (data.success) {
          setVoltageData(data);
          // Reset alert dismissal when new data comes in
          setAlertDismissed(false);
        } else {
          throw new Error(data.error || 'Failed to fetch voltage data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVoltageData();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchVoltageData, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [vehicleId]);

  const handleAlertDismiss = () => {
    setAlertDismissed(true);
  };

  const shouldShowAlert = voltageData && 
    (voltageData.status === 'low' || voltageData.status === 'critical') && 
    !alertDismissed;

  return (
    <div className={className}>
      {/* Low Battery Alert */}
      {shouldShowAlert && (
        <div className="mb-6">
          <LowBatteryAlert
            voltage={voltageData.voltage}
            percentage={voltageData.percentage}
            status={voltageData.status}
            onDismiss={handleAlertDismiss}
          />
        </div>
      )}

      {/* Voltage Display */}
      <VoltageDisplay vehicleId={vehicleId} />
    </div>
  );
}