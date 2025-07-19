import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { VoltageHistoryPageClient } from "@/components/battery/voltage-history-page";

export default async function VoltageHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <VoltageHistoryPageClient />;
}