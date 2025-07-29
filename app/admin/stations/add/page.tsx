import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { AddStationForm } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AddStationPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== 'admin') {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-8 px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/dashboard">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Add Charging Station
                        </h1>
                        <p className="text-muted-foreground">
                            Add a new charging station to the network
                        </p>
                    </div>
                </div>

                {/* Add Station Form */}
                <AddStationForm />
            </div>
        </div>
    );
}