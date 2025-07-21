import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import mongoose from "mongoose";
import Link from "next/link";
import { BatteryMonitor } from "@/components/battery/battery-monitor";
import { ActiveSessionsCard } from "@/components/sessions/active-sessions-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Battery, MapPin, History, Settings } from "lucide-react";
import connectDB from "@/lib/mongodb";
import UserDevice from "@/models/UserDevice";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await connectDB()

  const userDevice = await UserDevice.findOne({ userId: new mongoose.Types.ObjectId(session.user.id) })
  const vehicleId = userDevice ? userDevice.vehicleId : null

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Smart EV Battery Monitor
          </h1>
          <p className="text-gray-600">
            Welcome back, {session.user.name}! Monitor your battery status and find charging stations.
          </p>
        </div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Battery Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Battery Monitor with Alert and Display */}
            <BatteryMonitor className="w-full" vehicleId={vehicleId} />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="h-auto p-4">
                    <Link href="/stations" className="flex flex-col items-center gap-2">
                      <MapPin className="h-6 w-6 text-blue-600" />
                      <div className="text-center">
                        <div className="font-medium">Find Charging Stations</div>
                        <div className="text-xs text-muted-foreground">
                          Locate nearby charging points
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="h-auto p-4">
                    <Link href="/history" className="flex flex-col items-center gap-2">
                      <History className="h-6 w-6 text-green-600" />
                      <div className="text-center">
                        <div className="font-medium">Voltage History</div>
                        <div className="text-xs text-muted-foreground">
                          View battery performance
                        </div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Information Cards */}
          <div className="space-y-6">
            {/* Active Charging Sessions */}
            <ActiveSessionsCard />

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">Name</div>
                  <div className="text-sm">{session.user.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Email</div>
                  <div className="text-sm">{session.user.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">User Id</div>
                  <div className="text-sm">{session.user.id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Role</div>
                  <div className="text-sm capitalize">{session.user.role}</div>
                </div>
              </CardContent>
            </Card>

            {/* Battery Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Battery className="h-5 w-5 text-blue-600" />
                  Battery Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium">Optimal Range</div>
                      <div className="text-muted-foreground text-xs">
                        Keep battery between 20-80% for longevity
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium">Low Battery Alert</div>
                      <div className="text-muted-foreground text-xs">
                        Charge when voltage drops below 48V
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium">Critical Level</div>
                      <div className="text-muted-foreground text-xs">
                        Find charging immediately below 45V
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Connection</span>
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Sync</span>
                    <span className="text-sm font-medium">Just now</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Data Source</span>
                    <span className="text-sm font-medium">ESP32 Device</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}