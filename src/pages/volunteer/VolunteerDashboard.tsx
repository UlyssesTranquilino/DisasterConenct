import { useState, useEffect } from "react";
import { MapPin, Search, Bell, ChevronDown, Clock, CheckCircle, AlertTriangle, Users, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import VolunteerMap from "../../components/VolunteerMap";
import { apiService, type Assignment, type Need } from "../../lib/api"; 

// Define types inline for map compatibility
interface MapLocation {
  id: string;
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

interface Mission {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  hoursCompleted: number;
  status: "Completed" | "Ongoing" | "Cancelled";
  skillsUsed: string[];
  feedback?: string;
}

// Gradient background style for cards
const cardGradientStyle = {
  background: "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

// Mock metrics for volunteer dashboard - will be updated with real data
const mockVolunteerMetrics = [
  {
    title: "Active Assignments",
    value: "0",
    change: "+0",
    icon: "Clock",
    color: "text-blue-400"
  },
  {
    title: "Completed Missions",
    value: "0",
    change: "+0",
    icon: "CheckCircle",
    color: "text-green-400"
  },
  {
    title: "Available Hours",
    value: "0",
    change: null,
    icon: "Clock",
    color: "text-yellow-400"
  },
  {
    title: "Urgent Needs Nearby",
    value: "0",
    change: null,
    icon: "AlertTriangle",
    color: "text-red-400"
  },
];

// Convert assignments to MapLocation format for VolunteerMap
const convertAssignmentsToMapLocations = (assignments: Assignment[]): MapLocation[] => {
  return assignments.map(assignment => ({
    id: assignment.id,
    name: assignment.title,
    location: assignment.location,
    position: [assignment.coordinates.lat, assignment.coordinates.lng] as [number, number],
    capacity: 100, // Default value for map display
    supplies: assignment.supplies || [],
    contact: assignment.organizationContact,
    occupancy: assignment.status === 'Completed' ? 100 : assignment.status === 'In Progress' ? 50 : 25,
    coordinates: assignment.coordinates,
    type: 'volunteer' as const
  }));
};

const getIconComponent = (iconName: string, size: number = 16) => {
  switch (iconName) {
    case "Clock":
      return <Clock size={size} />;
    case "CheckCircle":
      return <CheckCircle size={size} />;
    case "AlertTriangle":
      return <AlertTriangle size={size} />;
    case "MapPin":
      return <MapPin size={size} />;
    case "Users":
      return <Users size={size} />;
    case "Bell":
      return <Bell size={size} />;
    default:
      return <Clock size={size} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-500/20 text-green-400";
    case "In Progress":
      return "bg-blue-500/20 text-blue-400";
    case "Pending":
      return "bg-yellow-500/20 text-yellow-400";
    case "Cancelled":
      return "bg-red-500/20 text-red-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High":
    case "Critical":
      return "bg-red-500/20 text-red-400";
    case "Medium":
      return "bg-yellow-500/20 text-yellow-400";
    case "Low":
      return "bg-green-500/20 text-green-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
};

export default function VolunteerDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [activeTab, setActiveTab] = useState<'assignments' | 'missions'>('assignments');
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch assignments
      const assignmentsResponse = await apiService.getAssignments();
      if (assignmentsResponse.success && assignmentsResponse.data) {
        setAssignments(assignmentsResponse.data);
        if (assignmentsResponse.data.length > 0) {
          setSelectedAssignment(assignmentsResponse.data[0]);
        }
      }

      // Fetch needs for urgent count (we'll just get count from this)
      const needsResponse = await apiService.getNeeds();
      if (needsResponse.success && needsResponse.data) {
        setNeeds(needsResponse.data);
      }

      // For now, we'll use mock missions until backend supports it
      // TODO: Replace with real API call when available
      setMissions([]); // Clear mock data

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load dashboard data");
      // Fallback to empty arrays
      setAssignments([]);
      setNeeds([]);
      setMissions([]);
    } finally {
      setLoading(false);
    }
  };

  // Convert assignments to map locations
  const mapLocations = convertAssignmentsToMapLocations(assignments);

  // Remove scrollbar from entire page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsGettingLocation(false);
        console.log("User location:", latitude, longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsGettingLocation(false);
        alert("Unable to retrieve your location. Please check your location settings.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Get directions function
  const getDirections = (assignment: Assignment) => {
    if (!userLocation) {
      alert("Please allow location access to get directions");
      getUserLocation();
      return;
    }

    const { lat, lng } = assignment.coordinates;
    
    // Check if we're on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Use device's native maps app
      const url = `https://maps.google.com/maps?daddr=${lat},${lng}&travelmode=driving`;
      window.open(url, '_blank');
    } else {
      // Use Google Maps web version
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  // Calculate metrics from real data
  const calculatedMetrics = [
    {
      ...mockVolunteerMetrics[0],
      value: assignments.filter(a => a.status === 'In Progress' || a.status === 'Pending').length.toString()
    },
    {
      ...mockVolunteerMetrics[1],
      value: assignments.filter(a => a.status === 'Completed').length.toString()
    },
    {
      ...mockVolunteerMetrics[2],
      value: "20" // This would come from availability data
    },
    {
      ...mockVolunteerMetrics[3],
      value: needs.filter(n => n.urgency === "High").length.toString()
    }
  ];

  const activeAssignments = assignments.filter(a => a.status !== 'Completed');

  // Filter assignments based on search
  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(search.toLowerCase()) ||
    assignment.organization.toLowerCase().includes(search.toLowerCase()) ||
    assignment.location.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMissions = missions.filter(mission =>
    mission.title.toLowerCase().includes(search.toLowerCase()) ||
    mission.organization.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateStatus = async (assignmentId: string, newStatus: Assignment['status']) => {
    try {
      // Update via API if endpoint exists
      // await apiService.updateAssignmentStatus(assignmentId, newStatus);
      
      // Update local state
      setAssignments(prev => prev.map(assignment =>
        assignment.id === assignmentId ? { ...assignment, status: newStatus } : assignment
      ));
      
      // Update selected assignment if it's the one being modified
      if (selectedAssignment && selectedAssignment.id === assignmentId) {
        setSelectedAssignment({
          ...selectedAssignment,
          status: newStatus
        });
      }
      
      alert(`Assignment status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update assignment status");
    }
  };

  const handleAssignmentSelect = (assignment: Assignment) => {
    console.log("Selecting assignment:", assignment);
    setSelectedAssignment(assignment);
  };

  // Handle map location selection (convert back to assignment)
  const handleMapLocationSelect = (location: MapLocation) => {
    const assignment = assignments.find(a => a.id === location.id);
    if (assignment) {
      handleAssignmentSelect(assignment);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="px-3 md:px-4 space-y-3 pb-3 overflow-hidden h-screen flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="px-3 md:px-4 space-y-3 pb-3 overflow-hidden h-screen">
      {/* Header - Simplified without search */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-base font-semibold text-white">Volunteer Dashboard</h1>
          <p className="text-xs text-gray-400">Welcome back!</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
          <Button
            onClick={fetchDashboardData}
            className="mt-2 bg-red-600 hover:bg-red-500 text-white text-xs h-8"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 1. Top Row Metric Cards - Shorter */}
      <div className="flex justify-center">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-5xl">
          {calculatedMetrics.map((metric, index) => (
            <Card key={index} className="border-0 w-full" style={cardGradientStyle}>
              <CardContent className="text-center p-3">
                <div className={`flex justify-center mb-1 ${metric.color}`}>
                  {getIconComponent(metric.icon, 18)}
                </div>
                <div className="text-xl font-bold text-white">
                  {metric.value}
                </div>
                <div className="text-xs text-white opacity-80">
                  {metric.title}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 2. Main Content Area - FIXED HEIGHTS */}
      <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        
        {/* Map Overview - Compact */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="border-0 flex-1 flex flex-col min-h-0" style={cardGradientStyle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-0">
              <CardTitle className="text-sm font-medium text-white">
                Assignments Map
              </CardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">
                  {activeAssignments.length} active
                </span>
                <Button
                  size="sm"
                  className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-500"
                  onClick={getUserLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? "Locating..." : "My Location"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
              <div style={{ height: '400px' }}> {/* Fixed height for map */}
                <VolunteerMap 
                  centers={mapLocations}
                  onLocationSelect={handleMapLocationSelect}
                  userLocation={userLocation}
                  selectedLocationId={selectedAssignment?.id}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Assignment List and Details - FIXED HEIGHTS */}
        <div className="flex flex-col space-y-4 h-full">
          
          {/* Tabs for Assignments/Missions - FIXED HEIGHT WITH SCROLL */}
          <Card className="border-0 flex flex-col" style={cardGradientStyle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-14 border-b-0">
              <div className="flex space-x-3">
                <button
                  onClick={() => setActiveTab('assignments')}
                  className={`text-xs font-medium transition-colors ${
                    activeTab === 'assignments'
                      ? 'text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Assignments ({activeAssignments.length})
                </button>
                <button
                  onClick={() => setActiveTab('missions')}
                  className={`text-xs font-medium transition-colors ${
                    activeTab === 'missions'
                      ? 'text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Missions ({missions.length})
                </button>
              </div>
            </CardHeader>
            
            {/* Search Bar - INSIDE THE CARD */}
            <div className="px-3 pt-0 pb-2">
              <div className="flex items-center bg-gray-900 border border-gray-700 rounded px-2 py-1.5">
                <Search size={14} className="text-gray-400 mr-1" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-gray-400 focus:outline-none w-full"
                />
              </div>
            </div>
            
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
              {/* Fixed height container with scroll */}
              <div className="h-[325px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {activeTab === 'assignments' ? (
                  <div className="space-y-2">
                    {filteredAssignments.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-xs text-neutral-400">No assignments found</p>
                      </div>
                    ) : (
                      filteredAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className={`p-2 bg-gray-800/50 rounded border cursor-pointer transition-all ${
                            selectedAssignment?.id === assignment.id 
                              ? 'border-blue-500 bg-blue-500/10' 
                              : 'border-gray-700 hover:border-blue-500'
                          }`}
                          onClick={() => handleAssignmentSelect(assignment)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-white font-medium text-xs flex-1 mr-2 line-clamp-1">
                              {assignment.title}
                            </h4>
                            <div className="flex space-x-1">
                              <span className={`px-1.5 py-0.5 rounded text-xs ${getPriorityColor(assignment.priority)}`}>
                                {assignment.priority}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-blue-400 text-xs mb-1">{assignment.organization}</p>
                          
                          <div className="flex justify-between items-center text-xs text-gray-400">
                            <div className="flex items-center space-x-1">
                              <MapPin size={10} />
                              <span className="truncate max-w-[80px]">{assignment.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock size={10} />
                              <span>Due: {assignment.dueDate}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-1">
                            {assignment.requiredSkills?.slice(0, 2).map((skill: string, index: number) => (
                              <span key={index} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>

                          {assignment.status !== 'Completed' && (
                            <div className="flex gap-1 mt-2">
                              <Button
                                size="sm"
                                className="text-xs h-6 bg-green-600 hover:bg-green-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(assignment.id, 'Completed');
                                }}
                              >
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                className="text-xs h-6 bg-blue-600 hover:bg-blue-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  getDirections(assignment);
                                }}
                              >
                                <Navigation size={12} className="mr-1" />
                                Directions
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredMissions.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-xs text-neutral-400">No missions found</p>
                      </div>
                    ) : (
                      filteredMissions.map((mission) => (
                        <div
                          key={mission.id}
                          className="p-2 bg-gray-800/50 rounded border border-gray-700"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-white font-medium text-xs line-clamp-1">
                              {mission.title}
                            </h4>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusColor(mission.status)}`}>
                              {mission.status}
                            </span>
                          </div>
                          <p className="text-blue-400 text-xs mb-1">{mission.organization}</p>
                          <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>{mission.startDate}</span>
                            <span>{mission.hoursCompleted}h</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment Detail Panel - FIXED HEIGHT */}
          <Card className="border-0 flex flex-col" style={cardGradientStyle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-0">
              <CardTitle className="text-sm font-medium text-white">
                {selectedAssignment ? "Details" : "Select Assignment"}
              </CardTitle>
              {selectedAssignment && selectedAssignment.status !== 'Completed' && (
                <div className="flex space-x-1">
                  <Button
                    onClick={() => handleUpdateStatus(selectedAssignment.id, 'Completed')}
                    size="sm"
                    className="h-6 px-2 text-xs bg-green-600 hover:bg-green-500"
                  >
                    Complete
                  </Button>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
              {selectedAssignment ? (
                <div className="flex-1 flex flex-col p-3 space-y-3 h-full">
                  {/* Assignment Header - Compact */}
                  <div className="text-center flex-shrink-0">
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 leading-tight">{selectedAssignment.title}</h3>
                    <p className="text-blue-400 text-xs line-clamp-1">{selectedAssignment.organization}</p>
                  </div>

                  {/* Description - Expanded to fill space */}
                  <div className="bg-neutral-800/30 rounded p-3 min-h-0 flex flex-col">
                    <h4 className="text-neutral-300 text-xs font-medium mb-2 flex-shrink-0">Description</h4>
                    <p className="text-white text-xs leading-relaxed overflow-y-auto flex-1">
                      {selectedAssignment.description}
                    </p>
                  </div>

                  {/* Details Grid - Takes remaining space */}
                  <div className="space-y-3 bg-neutral-800/30 rounded p-3 flex-1 min-h-0 flex flex-col">
                    <div className="grid grid-cols-2 gap-3 flex-shrink-0">
                      <div className="flex flex-col">
                        <span className="text-neutral-300 text-xs font-medium">Status</span>
                        <span className={`px-2 py-1 rounded text-xs mt-1 ${getStatusColor(selectedAssignment.status)}`}>
                          {selectedAssignment.status}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-neutral-300 text-xs font-medium">Priority</span>
                        <span className={`px-2 py-1 rounded text-xs mt-1 ${getPriorityColor(selectedAssignment.priority)}`}>
                          {selectedAssignment.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 flex-shrink-0">
                      <div className="flex flex-col">
                        <span className="text-neutral-300 text-xs font-medium">Due Date</span>
                        <span className="text-white text-xs mt-1">{selectedAssignment.dueDate}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-neutral-300 text-xs font-medium">Hours</span>
                        <span className="text-white text-xs mt-1">{selectedAssignment.estimatedHours}h</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <span className="text-neutral-300 text-xs font-medium">Location</span>
                      <div className="flex items-center mt-1">
                        <MapPin size={12} className="text-blue-400 mr-1 flex-shrink-0" />
                        <span className="text-white text-xs line-clamp-2">{selectedAssignment.location}</span>
                      </div>
                    </div>

                    {/* Required Skills - Expanded */}
                    <div className="flex-1 min-h-0 flex flex-col">
                      <span className="text-neutral-300 text-xs font-medium flex-shrink-0">Required Skills</span>
                      <div className="flex flex-wrap gap-1 mt-1 overflow-y-auto flex-1">
                        {selectedAssignment.requiredSkills?.map((skill: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs flex-shrink-0">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Supplies if available */}
                    {selectedAssignment.supplies && selectedAssignment.supplies.length > 0 && (
                      <div className="flex-shrink-0">
                        <span className="text-neutral-300 text-xs font-medium">Supplies Provided</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedAssignment.supplies.map((supply: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                              {supply}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Fixed at bottom */}
                  <div className="flex space-x-2 flex-shrink-0">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-2"
                      onClick={() => getDirections(selectedAssignment)}
                    >
                      <Navigation size={14} className="mr-1" />
                      Get Directions
                    </Button>
                    <Button 
                      className="flex-1 bg-gray-600 hover:bg-gray-500 text-white text-xs py-2"
                      onClick={getUserLocation}
                      disabled={isGettingLocation}
                    >
                      {isGettingLocation ? "Locating..." : "My Location"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-8 h-full">
                  <MapPin size={24} className="text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400 font-medium">
                    No Assignment Selected
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Select an assignment to view details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}