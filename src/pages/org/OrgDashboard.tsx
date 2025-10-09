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
  Settings,
} from "lucide-react";
import DisasterMap from "../../components/DisasterMap";
// --- Local Mock Data for Dashboard Content ---
const mockMetrics = [
  {
    title: "Active Evacuation Centers",
    value: "120",
    change: "+55%",
    icon: <MapPin size={16} />,
  },
  {
    title: "Total Evacuees",
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

// Sample evacuee data (you can replace with dynamic API data)
const evacueesData = [
  { day: "Mon", evacuees: 420 },
  { day: "Tue", evacuees: 510 },
  { day: "Wed", evacuees: 480 },
  { day: "Thu", evacuees: 530 },
  { day: "Fri", evacuees: 620 },
  { day: "Sat", evacuees: 580 },
  { day: "Sun", evacuees: 670 },
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
const MapOverview: React.FC = () => {
  return (
    <Card
      className="col-span-full h-[550px] border-0 relative pb-10"
      style={cardGradientStyle}
    >
      {/* Header with Legend */}
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between border-b-0 space-y-2 md:space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white">
          Map Overview
        </CardTitle>
        <div className="flex items-center space-x-4">
          <div className="text-xs text-white">Legend:</div>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2 text-xs text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-blue-400"></span>
              <span>Searched</span>
            </div>{" "}
            <div className="flex items-center space-x-2 text-xs text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <span>Urgent</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-orange-500"></span>
              <span>Evacuation Centers</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span>Volunteers</span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Content Section */}
      <CardContent className="h-full relative  ">
        {/* 🔍 Search Bar */}
        {/* <div className="absolute top-10 left-10 z-10 w-80">
          <div className="flex items-center bg-black/70 border border-neutral-700 rounded-lg p-2 backdrop-blur-sm">
            <Search size={16} className="text-neutral-400 mr-2" />
            <input
              type="text"
              placeholder="Search location..."
              className="bg-transparent text-white text-sm w-full outline-none placeholder:text-neutral-400"
            />
            <Layers
              size={16}
              className="text-neutral-400 ml-2 cursor-pointer hover:text-white"
            />
          </div>
        </div> */}

        {/* 🗺️ Real Map */}
        <div className="h-full w-full rounded-xl overflow-hidden">
          <DisasterMap />
        </div>
      </CardContent>
    </Card>
  );
};

// --- Recharts Bar Chart Component ---
const EvacueesTrendChart = () => (
  <Card className="border-0 h-full" style={cardGradientStyle}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-0">
      <CardTitle className="text-sm font-medium text-white">
        Evacuees Trend (Past 7 Days)
      </CardTitle>
      <ChevronDown size={16} className="text-neutral-400" />
    </CardHeader>

    <CardContent>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={evacueesData}
          margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
        >
          <XAxis
            dataKey="day"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
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
                return (
                  <div className="p-2 bg-neutral-900 border border-neutral-700 rounded-md text-white text-xs">
                    <p className="font-semibold text-blue-400">
                      {payload[0].payload.day}
                    </p>
                    <p>{`${payload[0].value} Evacuees`}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="evacuees" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-neutral-400 pt-2">
        Showing evacuees count for the past week
      </p>
    </CardContent>
  </Card>
);

// --- Resource Levels Card ---
const ResourceLevelsCard = () => {
  const resources = [
    { name: "Food Supplies", percent: 85, color: "#22c55e" }, // green
    { name: "Water", percent: 60, color: "#3b82f6" }, // blue
    { name: "Medical Kits", percent: 40, color: "#f59e0b" }, // orange
    { name: "Fuel", percent: 25, color: "#ef4444" }, // red
    { name: "Blankets", percent: 70, color: "#a855f7" }, // purple
  ];

  return (
    <Card className="border-0" style={cardGradientStyle}>
      <CardHeader className="flex flex-col space-y-0 pb-2 border-b-0">
        <CardTitle className="text-sm font-medium text-white">
          Resource Levels
        </CardTitle>
        <p className="text-xs text-neutral-400">
          Current available stock for disaster response
        </p>
      </CardHeader>

      <CardContent className="pt-2 space-y-4">
        {resources.map((res, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-white font-medium">{res.name}</span>
              <span
                className={`text-xs font-semibold ${
                  res.percent < 30
                    ? "text-red-400"
                    : res.percent < 60
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {res.percent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-neutral-800 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${res.percent}%`,
                  backgroundColor: res.color,
                  boxShadow: `0 0 2px ${res.color}`,
                }}
              ></div>
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="mt-6 text-xs text-neutral-400 border-t border-neutral-800 pt-3">
          <p>
            Last updated: <span className="text-white">2 hours ago</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Recent Announcements Card ---
const RecentAnnouncementsCard = () => {
  const announcements = [
    {
      title: "Relief Operations in Marikina",
      author: "Philippine Red Cross",
      time: "2 hours ago",
      category: "Relief",
    },
    {
      title: "Medical Team Deployed to Cebu",
      author: "DSWD",
      time: "5 hours ago",
      category: "Health",
    },
    {
      title: "Flood Alert: Cavite and Laguna",
      author: "NDRRMC",
      time: "1 day ago",
      category: "Alert",
    },
    {
      title: "Evacuation Centers Fully Operational",
      author: "LGU Quezon City",
      time: "2 days ago",
      category: "Update",
    },
  ];

  const categoryColors: Record<string, string> = {
    Relief: "#22c55e", // green
    Health: "#3b82f6", // blue
    Alert: "#ef4444", // red
    Update: "#f59e0b", // yellow
  };

  return (
    <Card className="border-0" style={cardGradientStyle}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white">
          Recent Announcements
        </CardTitle>
        <p className="text-xs text-neutral-400">
          {announcements.length} active this week
        </p>
      </CardHeader>

      <CardContent className="pt-2 space-y-3">
        {announcements.map((a, i) => (
          <div
            key={i}
            className="flex items-start justify-between bg-neutral-900/30 hover:bg-neutral-900/50 
                       transition-colors rounded-xl p-3 border border-neutral-800"
          >
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-white">{a.title}</h3>
              <p className="text-xs text-neutral-400">{a.author}</p>
              <p className="text-xs text-neutral-500 mt-1">{a.time}</p>
            </div>

            {/* Category badge */}
            <span
              className="text-xs font-semibold px-2 py-1 rounded-lg"
              style={{
                backgroundColor: `${categoryColors[a.category]}33`,
                color: categoryColors[a.category],
              }}
            >
              {a.category}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// --- Main Dashboard Component ---
export default function OrgDashboard() {
  return (
    <div className="px-2 md:px-4 space-y-4  ">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-3">
          {/* Search Bar */}
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-2 py-[5px]">
            <Search size={14} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none w-32 md:w-48"
            />
          </div>

          {/* Bell Button */}
          <Button variant="ghost" size="sm" className="h-8 hover:bg-gray-600">
            <Bell size={16} />
          </Button>
        </div>
      </div>
      {/* 1. Top Row Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockMetrics.map((metric, index) => (
          <Card key={index} className="border-0 " style={cardGradientStyle}>
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

      {/* 2. Map Overview (Spanning Full Width) */}
      <MapOverview />

      {/* 3. Bottom Row: Chart, Resources, Announcements */}
      <div className="grid gap-4 md:grid-cols-3 ">
        <div>
          <EvacueesTrendChart />
        </div>
        <div className="md:col-span-2">
          <ResourceLevelsCard />
        </div>
      </div>
      <RecentAnnouncementsCard />
    </div>
  );
}
