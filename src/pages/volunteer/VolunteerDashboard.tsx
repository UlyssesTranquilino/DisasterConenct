import { useState, useEffect } from "react";
import { MapPin, Search, Bell, ChevronDown, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import VolunteerMap from "../../components/VolunteerMap";
import EvacuationCenterPopup from "../../components/volunteer/EvacuationCenterPopup";

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

export default function VolunteerDashboard() {
  const [volunteers] = useState([
    {
      name: "Esthera Jackson",
      email: "esthera@simmimple.com",
      role: "Manager, Organization",
      status: "Online",
      date: "14/06/21",
    },
    {
      name: "Alex Johnson",
      email: "alex.j@example.com",
      role: "Medical Volunteer",
      status: "Online",
      date: "15/06/21",
    },
    {
      name: "Maria Garcia",
      email: "maria.g@example.com",
      role: "Logistics Coordinator",
      status: "Offline",
      date: "12/06/21",
    },
  ]);

  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState<'add' | 'edit'>('add');
  const [editingCenter, setEditingCenter] = useState<MapLocation | null>(null);
  const [evacuationCenters, setEvacuationCenters] = useState<MapLocation[]>(mockEvacuationCenters);

  // Remove scrollbar from entire page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
  };

  const handleAddCenter = () => {
    setPopupMode('add');
    setEditingCenter(null);
    setIsPopupOpen(true);
  };

  const handleEditCenter = (center: MapLocation) => {
    setPopupMode('edit');
    setEditingCenter(center);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingCenter(null);
  };

  const handleSubmitCenter = (data: any) => {
    if (popupMode === 'add') {
      // Add new center
      const newCenter: MapLocation = {
        id: Date.now(),
        name: data.name,
        location: data.location,
        position: [data.coordinates.lat, data.coordinates.lng],
        capacity: data.capacity,
        supplies: data.supplies,
        contact: data.contact,
        occupancy: 0, // New center starts with 0 occupancy
        coordinates: data.coordinates,
        type: 'evacuation'
      };
      setEvacuationCenters(prev => [...prev, newCenter]);
    } else {
      // Edit existing center
      const updatedCenter: MapLocation = {
        id: editingCenter!.id, // We know editingCenter exists in edit mode
        name: data.name,
        location: data.location,
        capacity: data.capacity,
        supplies: data.supplies,
        contact: data.contact,
        occupancy: editingCenter!.occupancy, // Preserve existing occupancy
        position: [data.coordinates.lat, data.coordinates.lng],
        coordinates: data.coordinates,
        type: editingCenter!.type || 'evacuation' // Preserve existing type
      };

      setEvacuationCenters(prev => 
        prev.map(center => 
          center.id === editingCenter!.id ? updatedCenter : center
        )
      );
      
      // Update selected location if it's the one being edited
      if (selectedLocation?.id === editingCenter!.id) {
        setSelectedLocation(updatedCenter);
      }
    }
    handleClosePopup();
  };

  return (
    <div className="px-2 md:px-4 space-y-4 pb-6 overflow-hidden h-screen">
      {/* Header with Search - Same as organization */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-lg font-semibold text-white">Volunteer Dashboard</h1>
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
            <Bell size={16} className="text-white" />
          </Button>
        </div>
      </div>

      {/* 1. Top Row Metric Cards - Same design as organization */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockVolunteerMetrics.map((metric, index) => (
          <Card key={index} className="border-0" style={cardGradientStyle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-0">
              <CardTitle className="text-sm font-medium text-white">
                {metric.title}
              </CardTitle>
              <div className="text-white">
                {getIconComponent(metric.icon)}
              </div>
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

      {/* 2. Main Content Area - UPDATED LAYOUT */}
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
        
        {/* Map Overview - Enlarged to take 2/3 of the width */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="border-0 flex-1 flex flex-col" style={cardGradientStyle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-0">
              <CardTitle className="text-sm font-medium text-white">
                Map Overview
              </CardTitle>
              <Button 
                onClick={handleAddCenter}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white"
              >
                Add Evacuation Center
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="h-full rounded-lg overflow-hidden">
                <VolunteerMap 
                  onLocationSelect={handleLocationSelect}
                  centers={evacuationCenters}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Volunteer List replaces the center details */}
        <div className="flex flex-col space-y-6 h-full">
          
          {/* Volunteer List - Now in the right column */}
          <Card className="border-0 flex-1" style={cardGradientStyle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-0">
              <CardTitle className="text-sm font-medium text-white">
                Volunteer List
              </CardTitle>
              <ChevronDown size={16} className="text-neutral-400" />
            </CardHeader>
            
            <CardContent className="flex-1 p-0">
              <div className="overflow-auto h-full">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 text-left border-b border-neutral-700">
                      <th className="p-3 font-medium">Name</th>
                      <th className="p-3 font-medium">Email</th>
                      <th className="p-3 font-medium">Role</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Employed</th>
                      <th className="p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map((v, index) => (
                      <tr 
                        key={v.email} 
                        className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors"
                      >
                        <td className="p-3 font-medium text-white">{v.name}</td>
                        <td className="p-3 text-neutral-300">{v.email}</td>
                        <td className="p-3 text-neutral-300">{v.role}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              v.status === "Online"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-neutral-600/30 text-neutral-400"
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td className="p-3 text-neutral-300">{v.date}</td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              // For demo, edit the first evacuation center
                              if (evacuationCenters[0]) {
                                handleEditCenter(evacuationCenters[0]);
                              }
                            }}
                            className="text-blue-400 hover:text-blue-300 cursor-pointer text-sm flex items-center gap-1"
                          >
                            <Edit size={14} />
                            Edit Center
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Small Center Detail Panel - Below Volunteer List */}
          <Card className="border-0" style={cardGradientStyle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-0">
              <CardTitle className="text-sm font-medium text-white">
                {selectedLocation ? selectedLocation.name : "Center Details"}
              </CardTitle>
              {selectedLocation && (
                <Button
                  onClick={() => handleEditCenter(selectedLocation)}
                  size="sm"
                  className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-500"
                >
                  <Edit size={12} className="mr-1" />
                  Edit
                </Button>
              )}
            </CardHeader>
            
            <CardContent className="space-y-3">
              {selectedLocation ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300 text-xs">Location</span>
                    <span className="text-white text-xs font-medium">{selectedLocation.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300 text-xs">Capacity</span>
                    <span className="text-white text-xs">{selectedLocation.capacity} people</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300 text-xs">Occupancy</span>
                    <span className="text-emerald-400 font-semibold text-xs">{selectedLocation.occupancy}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300 text-xs">Contact</span>
                    <span className="text-white text-xs">{selectedLocation.contact}</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-800">
                    <p className="text-neutral-300 text-xs mb-1">Supplies:</p>
                    <ul className="text-xs text-neutral-400 space-y-0.5">
                      {selectedLocation.supplies.map((supply, index) => (
                        <li key={index}>• {supply}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <MapPin size={20} className="text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">
                    Click on a map marker
                  </p>
                  <p className="text-xs text-neutral-500">
                    to view center details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Evacuation Center Popup */}
      <EvacuationCenterPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onSubmit={handleSubmitCenter}
        editingCenter={editingCenter}
        mode={popupMode}
      />
    </div>
  );
}