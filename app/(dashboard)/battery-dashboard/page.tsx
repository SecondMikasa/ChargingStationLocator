import { Metadata } from 'next';
import { BatteryMonitor } from '@/components/battery/battery-monitor';
import { CurrentMonitor } from '@/components/battery/current-monitor';

export const metadata: Metadata = {
  title: 'Battery Management System | Dashboard',
  description: 'Comprehensive battery monitoring with voltage, current, and power analytics',
};

export default function BatteryDashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Battery Management System</h1>
        <p className="text-muted-foreground">
          Monitor your battery voltage, current, power consumption, and charging status in real-time
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Real-time Current Monitor */}
        <div className="lg:col-span-1">
          <CurrentMonitor />
        </div>
        
        {/* Main Battery Display */}
        <div className="md:col-span-2">
          <BatteryMonitor showChart={false} />
        </div>
      </div>

      {/* Comprehensive Battery Analytics */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Battery Analytics</h2>
        <BatteryMonitor showChart={true} />
      </div>
    </div>
  );
}