import { StationTable } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminStationsPage() {

    return (
        <div className="container mx-auto py-8 px-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/dashboard">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Station Management
                            </h1>
                            <p className="text-muted-foreground">
                                Manage charging stations in the network
                            </p>
                        </div>
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

                {/* Station Management Table */}
                <StationTable />
            </div>
        </div>
    );
}