import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to your Dashboard
        </h1>
        <p className="text-gray-600 mb-4">
          Hello, {session.user.name}! You are successfully signed in.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            <strong>Email:</strong> {session.user.email}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Role:</strong> {session.user.role}
          </p>
          <p className="text-sm text-gray-500">
            <strong>User ID:</strong> {session.user.id}
          </p>
        </div>
      </div>
    </div>
  );
}