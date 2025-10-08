import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ChevronDown,
  MapPin,
  Search,
  Bolt,
  RefreshCw,
  Layers,
  Bell,
} from "lucide-react";

// --- Local Mock Data for Dashboard Content ---
const mockMetrics = [
  {
    title: "Active Evacuation Centers",
    value: "120",
    change: "+55%",
    icon: <MapPin size={16} />,
  },
  {
    title: "Total Documents",
    value: "2,300",
    change: "-4.5%",
    icon: <Bell size={16} />,
  },
  {
    title: "Total Volunteers",
    value: "3,234",
    change: null,
    icon: <RefreshCw size={16} />,
  },
  {
    title: "Urgent Requests",
    value: "10",
    change: null,
    icon: <Bolt size={16} />,
  },
];

const evacueesData = [
  { name: "100", value: 300 },
  { name: "200", value: 450 },
  { name: "300", value: 250 },
  { name: "400", value: 500 },
  { name: "500", value: 380 },
  { name: "600", value: 550 },
  { name: "700", value: 420 },
];

const recentAnnouncements = [
  {
    name: "Chaiva Soft UI Version",
    members: "8",
    budget: "$14,000",
    completion: "60%",
  },
  {
    name: "Add Progress Track",
    members: "5",
    budget: "$3,000",
    completion: "10%",
  },
  {
    name: "Fix Platform Errors",
    members: "10",
    budget: "Not set",
    completion: "100%",
  },
  {
    name: "Launch Our Mobile App",
    members: "7",
    budget: "$32,000",
    completion: "100%",
  },
  {
    name: "Add the New Pricing Page",
    members: "6",
    budget: "$400",
    completion: "25%",
  },
  {
    name: "Redesign New Online Shop",
    members: "9",
    budget: "$7,600",
    completion: "40%",
  },
];

// Gradient background style for cards
const cardGradientStyle = {
  background:
    "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)", // optional: adds a nice frosted glass effect
};

// --- Map Component Placeholder ---
const MapOverview = () => (
  <Card
    className="col-span-full h-[550px] dark:border-neutral-800"
    style={cardGradientStyle}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-white">
        Map Overview
      </CardTitle>
      <div className="flex items-center space-x-4">
        <div className="text-xs text-neutral-400">Legend:</div>
        <div className="flex items-center space-x-2 text-xs text-neutral-300">
          <span className="h-2 w-2 rounded-full bg-red-500"></span>
          <span>Warning</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-neutral-300">
          <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
          <span>Evacuation Centers</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-neutral-300">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          <span>Volunteers</span>
        </div>
      </div>
    </CardHeader>
    <CardContent className="h-full relative p-6">
      {/* Search Bar for Map */}
      <div className="absolute top-10 left-10 z-10 w-80">
        <div className="flex items-center bg-black/70 border border-neutral-700 rounded-lg p-2 backdrop-blur-sm">
          <Search size={16} className="text-neutral-400 mr-2" />
          <input
            type="text"
            placeholder="Search Google Maps"
            className="bg-transparent text-white text-sm w-full outline-none placeholder:text-neutral-400"
          />
          <Layers
            size={16}
            className="text-neutral-400 ml-2 cursor-pointer hover:text-white"
          />
        </div>
      </div>

      {/* Map Content - Using a dark, simplified map image as a placeholder */}
      <div className="h-full w-full rounded-xl overflow-hidden">
        <img
          src="/images/map-placeholder.png"
          alt="Map Overview"
          className="w-full h-full object-cover"
          style={{
            filter: "grayscale(0.8) brightness(0.7) contrast(1.2)",
            opacity: 0.8,
          }}
        />
        {/* Placeholder text for the detailed map area */}
        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-neutral-600 opacity-20 pointer-events-none">
          GEOSPATIAL DATA
        </div>
      </div>
    </CardContent>
  </Card>
);

// --- Recharts Bar Chart Component ---
const EvacueesTrendChart = () => (
  <Card className="dark:border-neutral-800" style={cardGradientStyle}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-white">
        Evacuees Trend
      </CardTitle>
      <ChevronDown size={16} className="text-neutral-400" />
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart
          data={evacueesData}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <XAxis dataKey="name" hide />
          <YAxis hide domain={[0, 600]} />
          <Tooltip
            cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="p-2 bg-neutral-900 border border-neutral-700 rounded-md text-white text-xs">
                    {`${payload[0].value} Evacuees`}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-neutral-400 pt-2">- (23) then last week</p>

      {/* Metrics below the chart */}
      <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-white">
        <div className="flex flex-col">
          <span className="text-neutral-400">Users</span>
          <span className="font-semibold text-lg">32,984</span>
        </div>
        <div className="flex flex-col">
          <span className="text-neutral-400">Clicks</span>
          <span className="font-semibold text-lg">2.42M</span>
        </div>
        <div className="flex flex-col">
          <span className="text-neutral-400">Sales</span>
          <span className="font-semibold text-lg">2,400$</span>
        </div>
        <div className="flex flex-col">
          <span className="text-neutral-400">Items</span>
          <span className="font-semibold text-lg">320</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

// --- Resource Levels Card ---
const ResourceLevelsCard = () => (
  <Card className="dark:border-neutral-800" style={cardGradientStyle}>
    <CardHeader className="flex flex-col space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-white">
        Resource Levels
      </CardTitle>
      <p className="text-xs text-neutral-400">
        Hello, Mark Johnson! Your Car is ready
      </p>
    </CardHeader>
    <CardContent className="flex flex-col items-center">
      {/* Battery/Health Circle */}
      <div className="relative w-32 h-32 flex items-center justify-center mt-4 mb-6">
        {/* SVG Circle for the progress ring */}
        <svg viewBox="0 0 100 100" className="absolute">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#1f2937"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={(1 - 0.68) * 2 * Math.PI * 45}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <span className="text-3xl font-bold text-white">68%</span>
        <span className="absolute bottom-2 text-xs text-neutral-400">
          Current load
        </span>
      </div>

      <p className="text-xl font-bold text-white mb-6">0h 58 min</p>
      <p className="text-xs text-neutral-400">Time to full charge</p>

      <div className="grid grid-cols-3 gap-3 w-full mt-4 border-t border-neutral-800 pt-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center text-sm font-semibold text-white">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-blue-600/30 border-blue-500 mr-2"
            >
              <RefreshCw size={14} className="text-blue-500" />
            </Button>
            Health
          </div>
          <span className="text-xs text-green-400 mt-1">76%</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center text-sm font-semibold text-white">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-blue-600/30 border-blue-500 mr-2"
            >
              <Bolt size={14} className="text-blue-500" />
            </Button>
            Consumption
          </div>
          <span className="text-xs text-neutral-300 mt-1">16.3W/km</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center text-sm font-semibold text-white">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-blue-600/30 border-blue-500 mr-2"
            >
              <Bolt size={14} className="text-blue-500" />
            </Button>
            Efficiency
          </div>
          <span className="text-xs text-green-400 mt-1">+20%</span>
        </div>
      </div>

      <div className="w-full mt-4 text-center">
        <p className="text-xs text-neutral-400">This Week</p>
        <p className="text-lg font-bold text-white">1.342km</p>
      </div>
    </CardContent>
  </Card>
);

// --- Recent Announcements Card ---
const RecentAnnouncementsCard = () => (
  <Card className="dark:border-neutral-800" style={cardGradientStyle}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-white">
        Recent Announcements
      </CardTitle>
      <p className="text-xs text-neutral-400">- 30 done this month</p>
    </CardHeader>
    <CardContent className="pt-2">
      {/* Table Header */}
      <div className="grid grid-cols-4 text-xs font-semibold text-neutral-400 pb-2 border-b border-neutral-800">
        <span className="col-span-2">COMPANIES</span>
        <span>MEMBERS</span>
        <span>BUDGET</span>
      </div>

      {/* Announcement Items */}
      {recentAnnouncements.map((announcement, index) => (
        <div
          key={index}
          className="grid grid-cols-4 items-center py-3 border-b border-neutral-800 last:border-b-0"
        >
          <div className="flex items-center col-span-2">
            <div className="h-6 w-6 rounded-full bg-blue-500/20 mr-2 flex items-center justify-center text-blue-400 text-xs font-bold">
              {announcement.name[0]}
            </div>
            <span className="text-sm text-white">{announcement.name}</span>
          </div>
          <span className="text-sm text-white">{announcement.members}</span>
          <span className="text-sm text-white">{announcement.budget}</span>
        </div>
      ))}
    </CardContent>
  </Card>
);

// --- Main Dashboard Component ---
export default function OrgDashboard() {
  return (
    <div className="p-4 md:p-6 space-y-4  ">
      {/* 1. Top Row Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockMetrics.map((metric, index) => (
          <Card
            key={index}
            className="dark:border-neutral-800"
            style={cardGradientStyle}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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

      {/* 2. Map Overview (Spanning Full Width) */}
      <MapOverview />

      {/* 3. Bottom Row: Chart, Resources, Announcements */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
        <EvacueesTrendChart />
        <ResourceLevelsCard />
        <RecentAnnouncementsCard />
      </div>
    </div>
  );
}
