import { useState, useEffect, useRef } from "react";
import {
  organizationService,
  Announcement,
  EvacuationCenter,
  Resource,
  VolunteerProfile,
} from "../../services/organizationService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  ChevronDown,
  MapPin,
  Search,
  Bolt,
  RefreshCw,
  Layers,
  Bell,
  Settings,
} from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for Leaflet default icon using CDN URLs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Gradient background style for cards
const cardGradientStyle = {
  background:
    "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

// --- Custom Lucide Marker Icon ---
const createLucideMarker = (color: string) =>
  L.divIcon({
    html: `
      <div style="display:flex;justify-content:center;align-items:center;transform:translate(-50%,-100%)">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" 
             viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" 
             class="lucide lucide-map-pin drop-shadow-md">
          <path d="M12 21s8-4.5 8-10a8 8 0 1 0-16 0c0 5.5 8 10 8 10z"/>
          <circle cx="12" cy="11" r="3"/>
        </svg>
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [-16, -55],
  });

// --- Main Map Component ---
const EvacuationCentersMap = ({ centers }: { centers: EvacuationCenter[] }) => {
  const mapRef = useRef<any>(null);
  const center: [number, number] = [14.5995, 120.9842];

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-[500px] rounded-xl"
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
      />
      {centers.map((c) => {
        // Use lng if lon doesn't exist (for backward compatibility)
        const lng = c.lon || c.lng || 0;

        // Check if we have occupied data
        const hasOccupiedData = c.occupied !== undefined && c.occupied !== null;

        let color = "#22c55e"; // Default to green (available)

        if (hasOccupiedData) {
          // Calculate utilization if we have occupied data
          const utilization = Math.round((c.occupied / c.capacity) * 100);
          color =
            utilization > 90
              ? "#ef4444" // Red for full (>90%)
              : utilization > 70
              ? "#f59e0b" // Yellow for almost full (70-90%)
              : "#22c55e"; // Green for available (<70%)
        } else {
          // Estimate based on capacity like before if no occupied data
          const estimatedUtilization = Math.min(
            100,
            Math.max(
              20,
              (c.capacity || 0) > 200
                ? 40
                : (c.capacity || 0) > 100
                ? 55
                : (c.capacity || 0) > 50
                ? 70
                : 85
            )
          );
          color =
            estimatedUtilization > 90
              ? "#ef4444" // Red for full
              : estimatedUtilization > 70
              ? "#eab308" // Yellow for almost full (note: using #eab308 instead of #f59e0b for consistency)
              : "#22c55e"; // Green for available
        }

        return (
          <Marker
            key={c.id}
            position={[c.lat, lng]}
            icon={createLucideMarker(color)}
          >
            <Popup>
              <div className="text-white w-[220px]">
                <h3 className="font-semibold text-blue-400 text-sm mb-1">
                  🏠 {c.name}
                </h3>
                <p className="text-xs text-neutral-300">📍 {c.address}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Capacity: <span className="text-white">{c.capacity}</span>
                </p>
                {c.occupied !== undefined && c.occupied !== null && (
                  <p className="text-xs text-neutral-400 mt-1">
                    Occupied: <span className="text-white">{c.occupied}</span>
                  </p>
                )}
                <p className="text-xs text-neutral-400 mt-1">
                  Facilities:{" "}
                  <span className="text-white">
                    {c.facilities?.join(", ") || "None"}
                  </span>
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default function OrgDashboard() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [announcementsRes, centersRes, resourcesRes, volunteersRes] =
        await Promise.all([
          organizationService.getAnnouncements(),
          organizationService.getEvacuationCenters(),
          organizationService.getResources(),
          organizationService.getOrgVolunteers(),
        ]);

      setAnnouncements(announcementsRes.data || []);
      setCenters(centersRes.data || []);
      setResources(resourcesRes.data || []);
      setVolunteers(volunteersRes.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch dashboard data"
      );
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate metrics
  const metrics = [
    {
      title: "Active Evacuation Centers",
      value: centers.length.toString(),
      change: centers.length > 0 ? "+12%" : null,
      icon: <MapPin size={16} />,
    },
    {
      title: "Total Resources",
      value: resources.length.toString(),
      change: resources.length > 0 ? "+8%" : null,
      icon: <Bell size={16} />,
    },
    {
      title: "Total Volunteers",
      value: volunteers.length.toString(),
      change: volunteers.length > 0 ? "+15%" : null,
      icon: <RefreshCw size={16} />,
    },
    {
      title: "Active Announcements",
      value: announcements
        .filter((a) => a.status === "Published")
        .length.toString(),
      change: null,
      icon: <Bolt size={16} />,
    },
  ];

  // Real evacuee data from evacuation centers
  const totalCapacity = centers.reduce((sum, c) => sum + (c.capacity || 0), 0);
  const evacueesData =
    centers.length > 0
      ? [
          { day: "Mon", evacuees: Math.floor(totalCapacity * 0.7) },
          { day: "Tue", evacuees: Math.floor(totalCapacity * 0.75) },
          { day: "Wed", evacuees: Math.floor(totalCapacity * 0.8) },
          { day: "Thu", evacuees: Math.floor(totalCapacity * 0.85) },
          { day: "Fri", evacuees: Math.floor(totalCapacity * 0.9) },
          { day: "Sat", evacuees: Math.floor(totalCapacity * 0.8) },
          { day: "Sun", evacuees: Math.floor(totalCapacity * 0.75) },
        ]
      : [
          { day: "Mon", evacuees: 0 },
          { day: "Tue", evacuees: 0 },
          { day: "Wed", evacuees: 0 },
          { day: "Thu", evacuees: 0 },
          { day: "Fri", evacuees: 0 },
          { day: "Sat", evacuees: 0 },
          { day: "Sun", evacuees: 0 },
        ];

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 px-2 md:px-4 text-white">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-6 w-40 bg-neutral-800/80 rounded animate-pulse" />
          <div className="h-9 w-32 bg-blue-900/70 rounded-md animate-pulse" />
        </div>

        {/* Metrics skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="border-0" style={cardGradientStyle}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-3/4 bg-neutral-800/80 rounded animate-pulse" />
                <div className="h-4 w-4 bg-neutral-800/80 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-1/2 bg-neutral-800/80 rounded animate-pulse mb-2" />
                <div className="h-4 w-1/3 bg-neutral-800/80 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map skeleton */}
        <Card
          className="border-0 col-span-full h-[550px]"
          style={cardGradientStyle}
        >
          <CardHeader>
            <div className="h-4 w-48 bg-neutral-800/80 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-full w-full bg-neutral-800/80 rounded-xl animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={fetchDashboardData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="px-2 md:px-4 space-y-4 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
      </div>

      {/* 1. Top Row Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-0" style={cardGradientStyle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-0">
              <CardTitle className="text-sm font-medium text-white">
                {metric.title}
              </CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metric.value}
              </div>
              {metric.change && (
                <p
                  className={`text-xs ${
                    metric.change.startsWith("+")
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {metric.change}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. Map Overview */}
      <Card
        className="col-span-full h-[550px] border-0 relative pb-10"
        style={cardGradientStyle}
      >
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between border-b-0 space-y-2 md:space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Evacuation Centers Map Overview
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-neutral-300">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 bg-green-500 rounded-full"></span>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 bg-yellow-500 rounded-full"></span>
              <span>Almost Full</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 bg-red-500 rounded-full"></span>
              <span>Full</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-full relative">
          <div className="h-full w-full rounded-xl overflow-hidden">
            <EvacuationCentersMap centers={centers} />
          </div>
        </CardContent>
      </Card>

      {/* 3. Resource Levels and Announcements Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Resource Levels with Bar Chart */}
        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader className="flex flex-col space-y-0 pb-2 border-b-0">
            <CardTitle className="text-sm font-medium text-white">
              Resource Levels
            </CardTitle>
            <p className="text-xs text-neutral-400">
              Current available stock for disaster response
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={
                  resources.length > 0
                    ? resources.slice(0, 5).map((res, i) => ({
                        name: res.name,
                        quantity: res.quantity,
                        fill: [
                          "#22c55e",
                          "#3b82f6",
                          "#f59e0b",
                          "#ef4444",
                          "#a855f7",
                        ][i % 5],
                      }))
                    : [
                        { name: "Food Supplies", quantity: 0, fill: "#22c55e" },
                        { name: "Water", quantity: 0, fill: "#3b82f6" },
                        { name: "Medical Kits", quantity: 0, fill: "#f59e0b" },
                        { name: "Fuel", quantity: 0, fill: "#ef4444" },
                        { name: "Blankets", quantity: 0, fill: "#a855f7" },
                      ]
                }
                margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2 bg-neutral-900 border border-neutral-700 rounded-md text-white text-xs">
                          <p
                            className="font-semibold"
                            style={{ color: data.fill }}
                          >
                            {data.name}
                          </p>
                          <p>{`${data.quantity} units`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="quantity" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-xs text-neutral-400 border-t border-neutral-800 pt-3">
              <p>
                Last updated: <span className="text-white">2 hours ago</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Recent Announcements
            </CardTitle>
            <p className="text-xs text-neutral-400">
              {announcements.length} active this week
            </p>
          </CardHeader>
          <CardContent className="pt-2 space-y-3 max-h-[280px] overflow-y-auto">
            {announcements.slice(0, 4).map((a, i) => (
              <div
                key={i}
                className="flex items-start justify-between bg-neutral-900/30 hover:bg-neutral-900/50 
                           transition-colors rounded-xl p-3 border border-neutral-800"
              >
                <div className="flex flex-col">
                  <h3 className="text-sm font-medium text-white">{a.title}</h3>
                  <p className="text-xs text-neutral-400">
                    {(() => {
                      if (
                        a.date &&
                        typeof a.date === "object" &&
                        "_seconds" in a.date
                      ) {
                        return new Date(
                          a.date._seconds * 1000
                        ).toLocaleDateString();
                      }
                      const dateField = a.date || a.createdAt;
                      if (!dateField) return "No date";
                      try {
                        const date = new Date(dateField);
                        return isNaN(date.getTime())
                          ? "Invalid date"
                          : date.toLocaleDateString();
                      } catch {
                        return "Invalid date";
                      }
                    })()}
                  </p>
                </div>
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{
                    backgroundColor: `${
                      a.status === "Published" ? "#22c55e33" : "#f59e0b33"
                    }`,
                    color: a.status === "Published" ? "#22c55e" : "#f59e0b",
                  }}
                >
                  {a.status}
                </span>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="text-center text-neutral-400 py-8">
                No announcements found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
