import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import DisasterMap from "../../components/DisasterMap";
import { MapPin, Search, Bell, ChevronDown, Edit } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

interface MapLocation {
  id: number;
  name: string;
  location: string;
  position: [number, number];
  capacity: number;
  supplies: string[];
  contact: string;
  occupancy: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  type?: 'evacuation' | 'urgent' | 'volunteer' | 'searched';
}

// Gradient background style for cards (same as organization)
const cardGradientStyle = {
  background: "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

// Mock metrics for volunteer dashboard - fixed icon rendering
const mockVolunteerMetrics = [
  {
    title: "Total Volunteers",
    value: "3,234",
    change: "+5%",
    icon: "MapPin",
  },
  {
    title: "Active Volunteers",
    value: "2,300",
    change: "+0.5%",
    icon: "Bell",
  },
  {
    title: "Available Volunteers",
    value: "1,850",
    change: "+12%",
    icon: "MapPin",
  },
  {
    title: "Urgent Requests",
    value: "10",
    change: null,
    icon: "Bell",
  },
];

const getIconComponent = (iconName: string, size: number = 16) => {
  switch (iconName) {
    case "MapPin":
      return <MapPin size={size} />;
    case "Bell":
      return <Bell size={size} />;
    default:
      return <MapPin size={size} />;
  }
};

// Mock evacuation centers data
const mockEvacuationCenters: MapLocation[] = [
  {
    id: 1,
    name: "Quezon City Memorial Center",
    location: "Quezon City, Metro Manila",
    position: [14.6506, 121.0500],
    capacity: 500,
    supplies: ["Food", "Water", "Medicine", "Blankets"],
    contact: "+63 912 345 6789",
    occupancy: 75,
    coordinates: { lat: 14.6506, lng: 121.0500 },
    type: "evacuation"
  },
  {
    id: 2,
    name: "Rizal Park Evacuation",
    location: "Manila, Metro Manila",
    position: [14.5832, 120.9790],
    capacity: 300,
    supplies: ["Water", "First Aid", "Emergency Kits"],
    contact: "+63 917 123 4567",
    occupancy: 60,
    coordinates: { lat: 14.5832, lng: 120.9790 },
    type: "evacuation"
  }
];




export default function CitizenDashboard() {
  const { currentUser, isLoading } = useAuth()

  const user = currentUser ?? {
    name: "John Doe",
    role: "Citizen",
    email: "johndoe@example.com",
  };
  
  console.log('CitizenDashboard rendering...', { currentUser, isLoading })
  
  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>
  }
  
  /*if (!currentUser) {
    return <div className="p-6">No user found. Please log in.</div>
  }*/
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Citizen Dashboard</h1>
        <p className="text-white">
          Welcome back, {user.name}! This is your disaster management portal.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader className="border-b-0 p-0">
            <CardTitle className="text-2xl font-bold text-white">Current Status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-white">No active requests. Stay safe and monitor announcements.</div>
          </CardContent>
        </Card>

        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader className="border-b-0 p-0">
            <CardTitle className="text-2xl font-bold text-white">Need Assistance?</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
          <Link to="/citizen/request-help">
            <Button className='w-full bg-blue-900 hover:bg-blue-950 text-white'>
              <AlertTriangle size={16} className="mr-2" /> 
              Request Help
            </Button>
          </Link>
          </CardContent>
        </Card>

      </div>



      <Card className="border-0 h-[450px] flex flex-col" style={cardGradientStyle}>
      <CardHeader className="border-b-0 p-0">
        <CardTitle className="text-white text-sm font-medium p-2">
          Disaster Map
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-full">
        <MapContainer
        center={[14.5995, 120.9842]}
        zoom={11}
        className="h-full w-full"
        > 
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          />
        </MapContainer>
      </CardContent>
    </Card>
    </div>

    
  )
}


