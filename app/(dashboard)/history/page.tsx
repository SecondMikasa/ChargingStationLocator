import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { BatteryHistoryPageClient } from "@/components/battery/voltage-history-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Battery Analytics | History',
  description: 'Comprehensive battery monitoring with voltage, current, and power analytics over time',
};

export default async function BatteryHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <BatteryHistoryPageClient />;
}