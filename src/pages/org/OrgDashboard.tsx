// src/pages/org/OrgDashboard.tsx
import { useOrganization } from "../../contexts/OrganizationContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { MapPin, Bell, RefreshCw, AlertCircle } from "lucide-react";
import { Skeleton } from "../../components/components/ui/skeleton";

// Update the OrgDashboard component
export default function OrgDashboard() {
  const { metrics, loading, error, refreshData } = useOrganization();

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Add more loading skeletons for other sections */}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-red-500 mb-4">
          <AlertCircle className="w-5 h-5" />
          <h2>Error loading dashboard</h2>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={refreshData}>Retry</Button>
      </div>
    );
  }

  // Data loaded
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organization Dashboard</h1>
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Evacuation Centers
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.evacuationCenters.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.evacuationCenters.occupied || 0} currently in use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Capacity
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.evacuationCenters.totalCapacity || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.evacuationCenters.availableCapacity || 0} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.volunteers || 0}</div>
            <p className="text-xs text-muted-foreground">Active volunteers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.resources || 0}</div>
            <p className="text-xs text-muted-foreground">
              Different resources tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Other dashboard sections would go here */}
    </div>
  );
}
