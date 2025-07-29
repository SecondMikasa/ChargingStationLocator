import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { StationTable } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="container mx-auto py-8 px-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Admin Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Welcome back, {session.user.name}! Manage charging stations and system settings.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href="/admin/stations/add">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Station
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Admin Info Card */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card text-card-foreground rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Admin Access</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">Active</p>
                    </div>
                    <div className="bg-card text-card-foreground rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Email</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{session.user.email}</p>
                    </div>
                    <div className="bg-card text-card-foreground rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Role</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 capitalize">{session.user.role}</p>
                    </div>
                    <div className="bg-card text-card-foreground rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">User ID</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{session.user.id}</p>
                    </div>
                </div>

            {/* Station Management */}
            <StationTable />
        </div>
    );
}