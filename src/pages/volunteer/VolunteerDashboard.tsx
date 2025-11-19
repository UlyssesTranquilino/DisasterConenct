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

      {/* 1. Top Row Metric Cards - Wider containers */}
      <div className="flex justify-center">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
          {mockVolunteerMetrics.map((metric, index) => (
            <Card key={index} className="border-0 w-full" style={cardGradientStyle}>
              <CardHeader className="flex flex-col items-center space-y-0 pb-2 border-b-0">
                <CardTitle className="text-sm font-medium text-white text-center leading-tight">
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                {/* Centered Icon */}
                <div className="flex justify-center">
                  <div className="text-white">
                    {getIconComponent(metric.icon, 20)}
                  </div>
                </div>
                {/* Value and Percentage */}
                <div className="space-y-1">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 2. Main Content Area - FIXED MAP CONTAINER */}
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
        
        {/* Map Overview - Fixed container issues */}
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
              {/* Fixed map container with strict overflow control */}
              <div className="h-full rounded-lg overflow-hidden relative isolate">
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <VolunteerMap 
                    onLocationSelect={handleLocationSelect}
                    centers={evacuationCenters}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Volunteer List and Center Details */}
        <div className="flex flex-col space-y-6 h-full">
          
          {/* Volunteer List - Scroll container pushed to bottom */}
          <Card className="border-0 flex-1 min-h-0 flex flex-col" style={cardGradientStyle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b-0">
              <CardTitle className="text-sm font-medium text-white">
                Volunteer List
              </CardTitle>
              <ChevronDown size={16} className="text-neutral-400" />
            </CardHeader>
            
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
              {/* Scrollable area that takes full available height */}
              <div className="overflow-auto flex-1">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-gray-900/95 backdrop-blur-sm">
                    <tr className="text-gray-400 text-left">
                      <th className="p-2 font-medium whitespace-nowrap">Name</th>
                      <th className="p-2 font-medium whitespace-nowrap">Email</th>
                      <th className="p-2 font-medium whitespace-nowrap">Role</th>
                      <th className="p-2 font-medium whitespace-nowrap">Status</th>
                      <th className="p-2 font-medium whitespace-nowrap">Employed</th>
                      <th className="p-2 font-medium whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map((v, index) => (
                      <tr 
                        key={v.email} 
                        className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors"
                      >
                        <td className="p-2 font-medium text-white whitespace-nowrap">{v.name}</td>
                        <td className="p-2 text-neutral-300 text-xs whitespace-nowrap">{v.email}</td>
                        <td className="p-2 text-neutral-300 text-xs whitespace-nowrap">{v.role}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              v.status === "Online"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-neutral-600/30 text-neutral-400"
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td className="p-2 text-neutral-300 text-xs whitespace-nowrap">{v.date}</td>
                        <td className="p-2">
                          <button
                            onClick={() => {
                              if (evacuationCenters[0]) {
                                handleEditCenter(evacuationCenters[0]);
                              }
                            }}
                            className="text-blue-400 hover:text-blue-300 cursor-pointer text-xs flex items-center gap-1 whitespace-nowrap"
                          >
                            <Edit size={12} />
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

          {/* Center Detail Panel - Centered content with enlarged text */}
          <Card className="border-0 flex-1 min-h-0 flex flex-col" style={cardGradientStyle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b-0">
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
            
            <CardContent className="flex-1 overflow-auto p-4 flex items-center justify-center">
              {selectedLocation ? (
                <div className="w-full max-w-md space-y-6">
                  {/* Center Title - Enlarged */}
                  <div className="text-center mb-6">
                    <h3 className="text-white font-semibold text-lg mb-2">{selectedLocation.name}</h3>
                    <p className="text-neutral-400 text-sm">{selectedLocation.location}</p>
                  </div>

                  {/* Details Grid - Enlarged and centered */}
                  <div className="space-y-4 bg-neutral-800/30 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-300 text-sm font-medium">Capacity</span>
                      <span className="text-white text-sm font-semibold">{selectedLocation.capacity} people</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-300 text-sm font-medium">Occupancy</span>
                      <span className="text-emerald-400 font-bold text-sm">{selectedLocation.occupancy}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-300 text-sm font-medium">Contact</span>
                      <span className="text-white text-sm font-medium text-right">{selectedLocation.contact}</span>
                    </div>
                  </div>

                  {/* Supplies Section - Enlarged */}
                  <div className="bg-neutral-800/30 rounded-lg p-4">
                    <p className="text-neutral-300 text-sm font-semibold mb-3 text-center">Available Supplies</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedLocation.supplies.map((supply, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                          <span className="text-white text-sm">{supply}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-8 w-full">
                  <MapPin size={32} className="text-neutral-600 mx-auto mb-4" />
                  <p className="text-base text-neutral-400 mb-2 font-medium">
                    Click on a map marker
                  </p>
                  <p className="text-sm text-neutral-500">
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