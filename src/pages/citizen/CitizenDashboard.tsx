import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { AlertTriangle, Currency } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../lib/auth";

export default function CitizenDashboard() {
  const { currentUser, isLoading } = useAuth();
  console.log("CURRENT USER: ", currentUser);

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (!isLoading && !currentUser) {
    return (
      <div className="p-6 text-center">
        No user found. Please{" "}
        <Link
          to="/login"
          className="text-blue-500 hover:underline font-semibold"
        >
          log in
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Citizen Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {currentUser.name}! This is your disaster management
          portal.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              No active requests. Stay safe and monitor announcements.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Need Assistance?</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/citizen/request-help">
              <Button>
                <AlertTriangle size={16} className="mr-2" />
                Request Help
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
