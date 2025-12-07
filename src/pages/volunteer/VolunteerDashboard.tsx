import { useState, useEffect } from "react";
import { 
  MapPin, Search, Clock, CheckCircle, AlertTriangle, Users, Navigation, 
  Plus, Star, X, RefreshCw, Wifi, WifiOff, Building2, 
  Network, Link, ExternalLink, UserPlus, Handshake, ChevronRight 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea"; // Ensure this path is correct
import VolunteerMap from "../../components/VolunteerMap";
import { apiService } from "../../lib/api"; 
import { useAuth } from "../../lib/auth";
import { ToastManager } from "../../components/components/ui/ToastNotification"; 

// --- Local Type Definitions (To support the immutable api.ts) ---

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface Organization {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  type?: string;
  status?: 'Active' | 'Inactive' | 'Pending';
  joinedDate?: string;
  tasksAssigned?: number;
  tasksCompleted?: number;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  logoUrl?: string;
}

export interface Assignment {
  id: string;
  title: string;
  organization: string;
  organizationId?: string;
  description: string;
  assignedDate?: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  priority: "Low" | "Medium" | "High" | "Critical";
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  requiredSkills?: string[];
  estimatedHours?: number;
  organizationContact?: string;
  supplies?: string[];
  volunteersNeeded?: number;
  volunteersAssigned?: number;
}

export interface Need {
  id: string;
  title: string;
  organization: string;
  urgency: "Low" | "Medium" | "High";
  [key: string]: any;
}

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

// Organization Stats Interface
interface OrganizationStats {
  totalLinked: number;
  activeCollaborations: number;
  completedTasks: number;
  averageResponseTime: string;
  lastOrganization: string;
  nextTaskDue: string | null;
}

// Organization Link Interface
interface OrganizationLink {
  id: string;
  volunteerId: string;
  organizationId: string;
  organizationName: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
}

// Gradient background style for cards
const cardGradientStyle = {
  background: "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

// Add Assignment Modal Component
function AddAssignmentModal({ isOpen, onClose, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (assignment: Partial<Assignment>) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organization, setOrganization] = useState("");
  const [location, setLocation] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Assignment['priority']>("Medium");

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      return;
    }

    onSubmit({
      title,
      description,
      organization,
      location,
      dueDate,
      priority,
      coordinates: { lat: 40.7128, lng: -74.0060 },
      estimatedHours: 4,
      status: "Pending",
      organizationContact: "Self-assigned"
    });

    setTitle("");
    setDescription("");
    setOrganization("");
    setLocation("");
    setDueDate("");
    setPriority("Medium");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">Create New Assignment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-white text-sm block mb-1">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment title"
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div>
            <label className="text-white text-sm block mb-1">Description *</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the assignment..."
              className="bg-gray-800 border-gray-700 min-h-[100px]"
            />
          </div>
          <div>
            <label className="text-white text-sm block mb-1">Organization</label>
            <Input
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Organization name"
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div>
            <label className="text-white text-sm block mb-1">Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location address"
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white text-sm block mb-1">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div>
              <label className="text-white text-sm block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Assignment['priority'])}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-gray-700">
          <Button onClick={onClose} variant="outline" className="border-gray-700">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-500">
            Create Assignment
          </Button>
        </div>
      </div>
    </div>
  );
}

// Organization Linking Modal Component
function OrganizationLinkingModal({ 
  isOpen, 
  onClose, 
  organizations,
  onLinkRequest,
  existingLinks
}: {
  isOpen: boolean;
  onClose: () => void;
  organizations: Organization[];
  onLinkRequest: (orgId: string, orgName: string) => void;
  existingLinks: OrganizationLink[];
}) {
  const [search, setSearch] = useState('');
  const [linking, setLinking] = useState<string | null>(null);

  const filteredOrgs = organizations.filter(org => {
    const orgName = org.name || '';
    const orgType = org.type || '';
    return (
      orgName.toLowerCase().includes(search.toLowerCase()) ||
      orgType.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getLinkStatus = (orgId: string) => {
    const link = existingLinks.find(l => l.organizationId === orgId);
    return link ? link.status : null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">Connect with Organizations</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-gray-800 border-gray-700 text-sm"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Connect with organizations to receive direct assignments and collaborate on disaster response.
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {filteredOrgs.length === 0 ? (
            <div className="text-center py-8">
              <Building2 size={32} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No organizations found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrgs.map((org) => {
                const linkStatus = getLinkStatus(org.id);
                const isLinking = linking === org.id;
                
                return (
                  <div
                    key={org.id}
                    className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                          <Building2 size={18} className="text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{org.name || "Unknown Organization"}</h4>
                          <p className="text-gray-400 text-sm">{org.type || "Organization"}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-300">
                              {org.tasksAssigned || 0} tasks • {org.tasksCompleted || 0} completed
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {linkStatus === 'approved' ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          Connected ✓
                        </span>
                      ) : linkStatus === 'pending' ? (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                          Pending...
                        </span>
                      ) : linkStatus === 'rejected' ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                          Rejected
                        </span>
                      ) : null}
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {org.description || "No description available"}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin size={12} />
                        <span className="truncate max-w-[120px]">
                          {org.address || "Address not available"}
                        </span>
                      </div>
                      
                      {!linkStatus ? (
                        <Button
                          onClick={() => {
                            setLinking(org.id);
                            onLinkRequest(org.id, org.name || "Unknown Organization");
                            setTimeout(() => setLinking(null), 1500);
                          }}
                          disabled={isLinking}
                          className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-7 px-3"
                        >
                          {isLinking ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <UserPlus size={12} className="mr-1" />
                              Connect
                            </>
                          )}
                        </Button>
                      ) : linkStatus === 'rejected' ? (
                        <Button
                          onClick={() => {
                            setLinking(org.id);
                            onLinkRequest(org.id, org.name || "Unknown Organization");
                            setTimeout(() => setLinking(null), 1500);
                          }}
                          disabled={isLinking}
                          className="bg-gray-600 hover:bg-gray-500 text-white text-xs h-7 px-3"
                        >
                          {isLinking ? "Retrying..." : "Try Again"}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => org.website && window.open(org.website, '_blank')}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-7 px-3"
                          disabled={!org.website}
                        >
                          <ExternalLink size={12} className="mr-1" />
                          {org.website ? "Visit" : "No Website"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <Button onClick={onClose} className="w-full bg-gray-700 hover:bg-gray-600">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// Convert assignments to MapLocation format for VolunteerMap
const convertAssignmentsToMapLocations = (assignments: Assignment[]): MapLocation[] => {
  return assignments.map(assignment => ({
    id: assignment.id,
    name: assignment.title,
    location: assignment.location,
    position: [assignment.coordinates.lat, assignment.coordinates.lng] as [number, number],
    capacity: 100,
    supplies: assignment.supplies || [],
    contact: assignment.organizationContact || "N/A",
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
    case "Building2":
      return <Building2 size={size} />;
    case "Network":
      return <Network size={size} />;
    case "Handshake":
      return <Handshake size={size} />;
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
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>([]);
  const [organizationLinks, setOrganizationLinks] = useState<OrganizationLink[]>([]);
  const [organizationStats, setOrganizationStats] = useState<OrganizationStats>({
    totalLinked: 0,
    activeCollaborations: 0,
    completedTasks: 0,
    averageResponseTime: "N/A",
    lastOrganization: "N/A",
    nextTaskDue: null
  });
  
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [activeTab, setActiveTab] = useState<'assignments' | 'missions'>('assignments');
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [showLinkOrganizations, setShowLinkOrganizations] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [retryCount, setRetryCount] = useState(0);
  
  // Initialize Toast Manager (New Implementation)
  const { toast, ToastContainer } = ToastManager();

  // Sample data
  const sampleAssignments: Assignment[] = [
    {
      id: "sample_1",
      title: "Food Bank Sorting",
      organization: "Community Food Bank",
      organizationId: "org_foodbank_001",
      description: "Help sort and organize food donations.",
      assignedDate: "2024-01-15",
      dueDate: "2024-01-20",
      status: "Pending",
      priority: "Medium",
      location: "123 Food Bank Ave",
      coordinates: { lat: 40.7128, lng: -74.0060 },
      requiredSkills: ["Organization", "Attention to detail"],
      estimatedHours: 4,
      organizationContact: "Maria Rodriguez - (555) 123-4567",
      supplies: ["Gloves", "Aprons"],
      volunteersNeeded: 5,
      volunteersAssigned: 2
    }
  ];

  const sampleMissions: Mission[] = [
    {
      id: "mission_1",
      title: "Flood Relief Distribution",
      organization: "Red Cross",
      startDate: "2024-01-05",
      endDate: "2024-01-10",
      hoursCompleted: 24,
      status: "Completed",
      skillsUsed: ["Logistics", "Team management"]
    }
  ];

  const sampleOrganizations: Organization[] = [
    {
      id: "org_001",
      name: "Red Cross Philippines",
      email: "contact@redcross.ph",
      phone: "+63 2 8790 2300",
      address: "37 EDSA, Mandaluyong, Metro Manila",
      description: "Leading humanitarian organization providing emergency assistance",
      type: "Humanitarian NGO",
      status: 'Active',
      joinedDate: "2024-01-01",
      tasksAssigned: 5,
      tasksCompleted: 3,
      contactPerson: "Maria Santos",
      contactEmail: "maria@redcross.ph",
      contactPhone: "+63 917 123 4567",
      website: "https://www.redcross.org.ph",
      logoUrl: "https://logo.clearbit.com/redcross.org.ph"
    },
    {
      id: "org_002",
      name: "World Food Programme",
      email: "philippines@wfp.org",
      phone: "+63 2 8812 3400",
      address: "5th Floor, PDRF Building, Pasig City",
      description: "United Nations agency fighting hunger worldwide",
      type: "UN Agency",
      status: 'Active',
      joinedDate: "2024-01-10",
      tasksAssigned: 12,
      tasksCompleted: 8,
      contactPerson: "Juan Dela Cruz",
      contactEmail: "juan@wfp.org",
      contactPhone: "+63 917 890 1234",
      website: "https://www.wfp.org/countries/philippines",
      logoUrl: ""
    }
  ];

  // Load organization links from localStorage on mount
  useEffect(() => {
    const savedLinks = localStorage.getItem('volunteer_org_links');
    if (savedLinks) {
      try {
        setOrganizationLinks(JSON.parse(savedLinks));
      } catch (error) {
        console.error("Failed to parse organization links:", error);
      }
    }
  }, []);

  // Fetch data from API
  useEffect(() => {
    fetchDashboardData();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setRetryCount(prev => prev + 1);
      
      if (!isOnline) {
        toast.warning('Offline Mode', 'You are offline. Please check your internet connection.');
      }
      
      let fetchedAssignments: Assignment[] = [];
      let fetchedNeeds: Need[] = [];
      let fetchedAvailableOrganizations: Organization[] = [];
      
      if (isOnline) {
        try {
          // Use generic apiRequest
          const assignmentsResponse = await apiService.apiRequest<ApiResponse<Assignment[]>>('/volunteer/assignments');
          if (assignmentsResponse.success && assignmentsResponse.data) {
            fetchedAssignments = assignmentsResponse.data;
          }
          
          // Use generic apiRequest for needs
          const needsResponse = await apiService.apiRequest<ApiResponse<Need[]>>('/volunteer/needs');
          if (needsResponse.success && needsResponse.data) {
            fetchedNeeds = needsResponse.data;
            
            // Extract unique organizations from needs
            const orgsFromNeeds = fetchedNeeds
              .filter((need, index, self) => 
                need.organization && 
                self.findIndex(n => n.organization === need.organization) === index
              )
              .map((need, index) => ({
                id: `org_need_${index}`,
                name: need.organization || "Unknown Organization",
                email: "contact@organization.ph",
                phone: "+63 2 000 0000",
                description: `Organization posting volunteer needs: "${need.title}"`,
                type: "NGO",
                status: 'Active' as const,
                joinedDate: new Date().toISOString().split('T')[0],
                tasksAssigned: fetchedNeeds.filter(n => n.organization === need.organization).length,
                tasksCompleted: 0,
                contactPerson: "Contact Person",
                contactEmail: "contact@organization.ph",
                contactPhone: "+63 917 000 0000",
                website: `https://${(need.organization || '').replace(/\s+/g, '').toLowerCase()}.org`,
                logoUrl: ""
              }));
            
            fetchedAvailableOrganizations.push(...orgsFromNeeds);
          }
          
        } catch (apiError) {
          console.error("API call failed, falling back to sample data:", apiError);
        }
      }
      
      // Set assignments
      if (fetchedAssignments.length > 0) {
        setAssignments(fetchedAssignments);
        if (fetchedAssignments.length > 0) {
          setSelectedAssignment(fetchedAssignments[0]);
        }
      } else {
        setAssignments(sampleAssignments);
        if (sampleAssignments.length > 0) {
          setSelectedAssignment(sampleAssignments[0]);
        }
      }
      
      // Set needs
      setNeeds(fetchedNeeds.length > 0 ? fetchedNeeds : []);
      
      // Set available organizations (combine sample with extracted ones)
      if (fetchedAvailableOrganizations.length > 0) {
        setAvailableOrganizations([...sampleOrganizations, ...fetchedAvailableOrganizations]);
      } else {
        setAvailableOrganizations(sampleOrganizations);
      }
      
      setMissions(sampleMissions);
      
      // Update organization stats based on linked organizations
      updateOrganizationStats();
      
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      
      // Fallback to sample data
      setAssignments(sampleAssignments);
      setNeeds([]);
      setAvailableOrganizations(sampleOrganizations);
      setMissions(sampleMissions);
      
      if (sampleAssignments.length > 0) {
        setSelectedAssignment(sampleAssignments[0]);
      }
      
      setError(error.message || "Using sample data.");
      toast.error('Connection Error', 'Using sample data for demonstration.');
      updateOrganizationStats();
      
    } finally {
      setLoading(false);
    }
  };

  const updateOrganizationStats = () => {
    const approvedLinks = organizationLinks.filter(link => link.status === 'approved');
    const activeAssignmentsList = assignments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled');
    const completedTasks = assignments.filter(a => a.status === 'Completed').length;
    
    const lastOrg = approvedLinks.length > 0 
      ? (approvedLinks[approvedLinks.length - 1].organizationName || "N/A")
      : "N/A";
    
    const nextTask = activeAssignmentsList.length > 0 
      ? new Date(activeAssignmentsList[0].dueDate).toLocaleDateString() 
      : null;
    
    setOrganizationStats({
      totalLinked: approvedLinks.length,
      activeCollaborations: activeAssignmentsList.length,
      completedTasks: completedTasks,
      averageResponseTime: approvedLinks.length > 0 ? "24h" : "N/A",
      lastOrganization: lastOrg,
      nextTaskDue: nextTask
    });
  };

  // Save organization links to localStorage
  const saveOrganizationLinks = (links: OrganizationLink[]) => {
    localStorage.setItem('volunteer_org_links', JSON.stringify(links));
    setOrganizationLinks(links);
    updateOrganizationStats();
  };

  // Handle linking request
  const handleLinkRequest = async (orgId: string, orgName: string) => {
    try {
      // Get user ID safely
      let userId = 'unknown-user-id';
      if (currentUser && currentUser.id) {
          userId = currentUser.id;
      }
      
      const newLink: OrganizationLink = {
        id: `link_${Date.now()}`,
        volunteerId: userId,
        organizationId: orgId,
        organizationName: orgName,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };
      
      const updatedLinks = [...organizationLinks, newLink];
      saveOrganizationLinks(updatedLinks);
      
      // Simulate approval after 2 seconds
      setTimeout(() => {
        const approvedLinks = updatedLinks.map(link =>
          link.id === newLink.id 
            ? { ...link, status: 'approved' as const, approvedAt: new Date().toISOString() }
            : link
        );
        saveOrganizationLinks(approvedLinks);
        toast.success(
          'Connection Approved!',
          `Your connection with ${orgName} has been approved! You'll now receive direct assignments from them.`
        );
      }, 2000);
      
      toast.success(
        'Link Request Sent!',
        `Your request to connect with ${orgName} has been submitted. Awaiting approval...`
      );
      
    } catch (error) {
      toast.error('Request Failed', 'Failed to send connection request. Please try again.');
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
      toast.error('Location Error', 'Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsGettingLocation(false);
        // Use specialized toast method
        toast.locationFound(latitude, longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsGettingLocation(false);
        toast.error('Location Error', 'Unable to get your location. Please try again.');
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
      toast.error('Location Required', 'Please allow location access to get directions');
      getUserLocation();
      return;
    }

    const { lat, lng } = assignment.coordinates;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`;
      window.open(url, '_blank');
    }
    
    // Use specialized toast method
    toast.directionsStarted(assignment.title);
  };

  // Handle adding new assignment
  const handleAddAssignment = (newAssignment: Partial<Assignment>) => {
    const assignmentWithId: Assignment = {
      ...newAssignment as Assignment,
      id: `user_${Date.now()}`,
      volunteersAssigned: 1,
      status: "Pending"
    };
    
    setAssignments(prev => [assignmentWithId, ...prev]);
    setSelectedAssignment(assignmentWithId);
    
    // Use specialized toast method
    toast.assignmentCreated(newAssignment.title!, newAssignment.organization || "Self-assigned");
  };

  // Calculate metrics
  const activeAssignments = assignments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled');
  const urgentNeeds = needs.filter(n => n.urgency === "High");
  const pendingLinks = organizationLinks.filter(link => link.status === 'pending').length;

  const calculatedMetrics = [
    {
      title: "Linked Organizations",
      value: organizationStats.totalLinked.toString(),
      icon: "Building2",
      color: "text-purple-400"
    },
    {
      title: "Active Collaborations",
      value: organizationStats.activeCollaborations.toString(),
      icon: "Network",
      color: "text-blue-400"
    },
    {
      title: "Completed Tasks",
      value: organizationStats.completedTasks.toString(),
      icon: "CheckCircle",
      color: "text-green-400"
    },
    {
      title: "Urgent Needs",
      value: urgentNeeds.length.toString(),
      icon: "AlertTriangle",
      color: "text-yellow-400"
    }
  ];

  const handleUpdateStatus = async (assignmentId: string, newStatus: Assignment['status']) => {
    try {
      setAssignments(prev => prev.map(assignment =>
        assignment.id === assignmentId ? { ...assignment, status: newStatus } : assignment
      ));
      
      if (selectedAssignment && selectedAssignment.id === assignmentId) {
        setSelectedAssignment({
          ...selectedAssignment,
          status: newStatus
        });
      }
      
      // Update organization stats
      updateOrganizationStats();
      
      // Toast notification
      toast.success('Status Updated', `Assignment status updated to ${newStatus}`);
      
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error('Update Failed', 'Failed to update assignment status');
    }
  };

  const handleAssignmentSelect = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
  };

  // Handle map location selection
  const handleMapLocationSelect = (location: MapLocation) => {
    const assignment = assignments.find(a => a.id === location.id);
    if (assignment) {
      handleAssignmentSelect(assignment);
    }
  };

  // Filter assignments based on search
  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(search.toLowerCase()) ||
    (assignment.organization || '').toLowerCase().includes(search.toLowerCase()) ||
    assignment.location.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMissions = missions.filter(mission =>
    mission.title.toLowerCase().includes(search.toLowerCase()) ||
    mission.organization.toLowerCase().includes(search.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className="px-3 md:px-4 space-y-3 pb-3 overflow-hidden h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 md:px-4 space-y-3 pb-3 h-screen overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-base font-semibold text-white">Volunteer Dashboard</h1>
          <p className="text-xs text-gray-400">
            Welcome back, {currentUser?.displayName || "Volunteer"}!
            {organizationStats.totalLinked > 0 && (
              <span className="ml-2 text-purple-400">
                Connected with {organizationStats.totalLinked} organization(s)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <Button
            onClick={() => setShowLinkOrganizations(true)}
            size="sm"
            className="h-8 bg-purple-600 hover:bg-purple-500 text-white text-xs"
            title="Connect with organizations"
          >
            <Handshake size={12} className="mr-1" />
            Connect ({availableOrganizations.length})
          </Button>
          <Button
            onClick={() => setShowAddAssignment(true)}
            size="sm"
            className="h-8 bg-green-600 hover:bg-green-500 text-white text-xs"
          >
            <Plus size={12} className="mr-1" />
            New Assignment
          </Button>
        </div>
      </div>

      {/* Add Assignment Modal */}
      <AddAssignmentModal
        isOpen={showAddAssignment}
        onClose={() => setShowAddAssignment(false)}
        onSubmit={handleAddAssignment}
      />

      {/* Organization Linking Modal */}
      <OrganizationLinkingModal
        isOpen={showLinkOrganizations}
        onClose={() => setShowLinkOrganizations(false)}
        organizations={availableOrganizations}
        onLinkRequest={handleLinkRequest}
        existingLinks={organizationLinks}
      />

      {/* Organization Connection Status */}
      {(organizationStats.totalLinked > 0 || pendingLinks > 0) && (
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <Link size={16} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium text-sm">Organization Connections</h3>
              <p className="text-purple-300 text-xs mt-1">
                {organizationStats.totalLinked > 0 && (
                  <>
                    Connected to {organizationStats.totalLinked} organization(s). 
                    {organizationStats.lastOrganization !== "N/A" && ` Latest: ${organizationStats.lastOrganization}`}
                    {organizationStats.nextTaskDue && ` • Next task due: ${organizationStats.nextTaskDue}`}
                    {pendingLinks > 0 && ` • ${pendingLinks} pending request(s)`}
                  </>
                )}
                {organizationStats.totalLinked === 0 && pendingLinks > 0 && (
                  <>You have {pendingLinks} pending connection request(s)</>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {pendingLinks > 0 && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs flex items-center">
                  <Clock size={10} className="mr-1" />
                  {pendingLinks} Pending
                </span>
              )}
              <Button
                onClick={() => setShowLinkOrganizations(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-7"
              >
                {organizationStats.totalLinked > 0 ? 'Manage' : 'Connect'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Connect Card (when no organizations linked) */}
      {organizationStats.totalLinked === 0 && !loading && (
        <Card className="border-0" style={cardGradientStyle}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Handshake size={16} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">Connect with Organizations</h3>
                  <p className="text-gray-400 text-xs">
                    Link with organizations to receive direct assignments and collaborate on disaster response
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowLinkOrganizations(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-7 px-3"
              >
                Browse Organizations
                <ChevronRight size={12} className="ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error/Info State */}
      {error && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-yellow-400" />
            <div className="flex-1">
              <p className="text-yellow-400 text-xs">{error}</p>
            </div>
            <Button
              onClick={fetchDashboardData}
              className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs h-7 flex items-center gap-1"
            >
              <RefreshCw size={10} />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {assignments.length === 0 && !loading && (
        <Card className="border-0" style={cardGradientStyle}>
          <CardContent className="text-center p-4">
            <div className="mb-2">
              <Star size={24} className="text-blue-400 mx-auto" />
            </div>
            <h3 className="text-white font-medium text-sm mb-1">No Assignments Yet</h3>
            <p className="text-gray-400 text-xs mb-3">
              {organizationStats.totalLinked > 0 
                ? `You are connected to ${organizationStats.totalLinked} organization(s). Browse needs to get started.`
                : 'Get started by connecting with organizations to receive assignments.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => window.location.href = '/volunteer/needs'}
                className="bg-blue-600 hover:bg-blue-500 text-xs h-8"
              >
                Browse Volunteer Needs
              </Button>
              {organizationStats.totalLinked === 0 && (
                <Button
                  onClick={() => setShowLinkOrganizations(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-xs h-8"
                >
                  <Handshake size={12} className="mr-1" />
                  Connect with Organizations
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Row Metric Cards */}
      {assignments.length > 0 && (
        <>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full">
              {calculatedMetrics.map((metric, index) => (
                <Card key={index} className="border-0 w-full" style={cardGradientStyle}>
                  <CardContent className="text-center p-2">
                    <div className={`flex justify-center mb-1 ${metric.color}`}>
                      {getIconComponent(metric.icon, 14)}
                    </div>
                    <div className="text-lg font-bold text-white">
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

          {/* Main Content Area - Proportional heights */}
          <div className="flex flex-col lg:flex-row gap-3" style={{ 
            height: 'calc(100vh - 320px)',
            minHeight: '400px'
          }}>
            
            {/* Map - Takes 2/3 width */}
            <div className="lg:w-2/3 h-full flex flex-col">
              <Card className="border-0 flex-1 flex flex-col min-h-0" style={cardGradientStyle}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3 flex-shrink-0">
                  <CardTitle className="text-sm font-medium text-white">
                    Assignments Map
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {activeAssignments.length} active • {organizationStats.totalLinked} orgs
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
                  {/* Map container - fills remaining space */}
                  <div className="h-full">
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

            {/* Right Column - Takes 1/3 width with internal grid */}
            <div className="lg:w-1/3 h-full flex flex-col">
              <div className="grid grid-rows-2 gap-3 h-full">
                
                {/* Assignments List - Top half */}
                <Card className="border-0 flex flex-col" style={cardGradientStyle}>
                  <div className="px-3 pt-3 pb-2 flex-shrink-0">
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
                  </div>
                  
                  {/* Search Bar */}
                  <div className="px-3 pb-2 flex-shrink-0">
                    <div className="flex items-center bg-gray-900 border border-gray-700 rounded px-2 py-1">
                      <Search size={12} className="text-gray-400 mr-1" />
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
                    <div className="flex-1 overflow-y-auto p-2">
                      {activeTab === 'assignments' ? (
                        <div className="space-y-2">
                          {filteredAssignments.length === 0 ? (
                            <div className="text-center py-4">
                              <p className="text-xs text-neutral-400">No assignments found</p>
                            </div>
                          ) : (
                            filteredAssignments.map((assignment) => {
                              const isFromLinkedOrg = organizationLinks.some(
                                link => link.organizationName === assignment.organization && link.status === 'approved'
                              );
                              
                              return (
                                <div
                                  key={assignment.id}
                                  className={`p-2 bg-gray-800/50 rounded border cursor-pointer transition-all ${
                                    selectedAssignment?.id === assignment.id 
                                      ? 'border-blue-500 bg-blue-500/10' 
                                      : 'border-gray-700 hover:border-blue-500'
                                  } ${isFromLinkedOrg ? 'border-l-4 border-l-purple-500' : ''}`}
                                  onClick={() => handleAssignmentSelect(assignment)}
                                >
                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-white font-medium text-xs flex-1 mr-2 line-clamp-1">
                                      {assignment.title}
                                    </h4>
                                    <div className="flex space-x-1">
                                      <span className={`px-1 py-0.5 rounded text-xs ${getStatusColor(assignment.status)}`}>
                                        {assignment.status}
                                      </span>
                                      <span className={`px-1 py-0.5 rounded text-xs ${getPriorityColor(assignment.priority)}`}>
                                        {assignment.priority}
                                      </span>
                                      {isFromLinkedOrg && (
                                        <span className="px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                                          Linked
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <p className="text-blue-400 text-xs mb-1 flex items-center">
                                    {assignment.organization}
                                    {isFromLinkedOrg && (
                                      <Handshake size={10} className="ml-1 text-purple-400" />
                                    )}
                                  </p>
                                  
                                  <div className="flex justify-between items-center text-xs text-gray-400">
                                    <div className="flex items-center space-x-1">
                                      <MapPin size={8} />
                                      <span className="truncate max-w-[60px]">{assignment.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Clock size={8} />
                                      <span>Due: {assignment.dueDate}</span>
                                    </div>
                                  </div>

                                  {assignment.status !== 'Completed' && assignment.status !== 'Cancelled' && (
                                    <div className="flex gap-1 mt-2">
                                      <Button
                                        size="sm"
                                        className="text-xs h-5 bg-green-600 hover:bg-green-500"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateStatus(assignment.id, 'Completed');
                                        }}
                                      >
                                        Complete
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="text-xs h-5 bg-blue-600 hover:bg-blue-500"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          getDirections(assignment);
                                        }}
                                      >
                                        <Navigation size={10} className="mr-1" />
                                        Directions
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredMissions.length === 0 ? (
                            <div className="text-center py-4">
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
                                  <span className={`px-1 py-0.5 rounded text-xs ${getStatusColor(mission.status)}`}>
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

                {/* Details Panel - Bottom half */}
                <Card className="border-0 flex flex-col" style={cardGradientStyle}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3 flex-shrink-0">
                    <CardTitle className="text-sm font-medium text-white">
                      {selectedAssignment ? "Details" : "Select Assignment"}
                    </CardTitle>
                    {selectedAssignment && selectedAssignment.status !== 'Completed' && selectedAssignment.status !== 'Cancelled' && (
                      <div className="flex space-x-1">
                        <Button
                          onClick={() => handleUpdateStatus(selectedAssignment.id, 'Completed')}
                          size="sm"
                          className="h-5 px-2 text-xs bg-green-600 hover:bg-green-500"
                        >
                          Complete
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                    {selectedAssignment ? (
                      <div className="flex-1 flex flex-col p-3 overflow-hidden">
                        {/* Header - Fixed height */}
                        <div className="text-center mb-2 flex-shrink-0">
                          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                            {selectedAssignment.title}
                          </h3>
                          <div className="flex items-center justify-center gap-2">
                            <p className="text-blue-400 text-xs line-clamp-1">
                              {selectedAssignment.organization}
                            </p>
                            {organizationLinks.some(
                              link => link.organizationName === selectedAssignment.organization && link.status === 'approved'
                            ) && (
                              <span className="px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs flex items-center">
                                <Handshake size={8} className="mr-1" />
                                Linked
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description - Fixed height */}
                        <div className="bg-neutral-800/30 rounded p-2 mb-1 flex-shrink-0">
                          <h4 className="text-neutral-300 text-xs font-medium mb-1">Description</h4>
                          <div className="h-[20px] overflow-y-auto">
                            <p className="text-white text-xs leading-relaxed">
                              {selectedAssignment.description}
                            </p>
                          </div>
                        </div>

                        {/* Details Grid - FLEXIBLE AREA (fills remaining space) */}
                        <div className="flex-1 flex flex-col min-h-0">
                          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            <div className="grid grid-cols-2 gap-2">
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
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-neutral-300 text-xs font-medium">Due Date</span>
                                <span className="text-white text-xs mt-1">{selectedAssignment.dueDate}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-neutral-300 text-xs font-medium">Hours</span>
                                <span className="text-white text-xs mt-1">{selectedAssignment.estimatedHours}h</span>
                              </div>
                            </div>

                            <div>
                              <span className="text-neutral-300 text-xs font-medium">Location</span>
                              <div className="flex items-center mt-1">
                                <MapPin size={12} className="text-blue-400 mr-1" />
                                <span className="text-white text-xs line-clamp-1">{selectedAssignment.location}</span>
                              </div>
                            </div>

                            {/* Organization Contact (if exists) */}
                            {selectedAssignment.organizationContact && (
                              <div>
                                <span className="text-neutral-300 text-xs font-medium">Contact</span>
                                <div className="flex items-center mt-1">
                                  <span className="text-white text-xs line-clamp-1">{selectedAssignment.organizationContact}</span>
                                </div>
                              </div>
                            )}

                            {/* Skills (if exists) */}
                            {selectedAssignment.requiredSkills && selectedAssignment.requiredSkills.length > 0 && (
                              <div className="flex flex-col">
                                <span className="text-neutral-300 text-xs font-medium">Skills</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {selectedAssignment.requiredSkills?.map((skill: string, index: number) => (
                                    <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons - Fixed at bottom */}
                          <div className="flex space-x-2 pt-3 flex-shrink-0">
                            <Button 
                              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-2"
                              onClick={() => getDirections(selectedAssignment)}
                            >
                              <Navigation size={12} className="mr-1" />
                              Directions
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
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <MapPin size={24} className="text-neutral-600 mx-auto mb-2" />
                        <p className="text-sm text-neutral-400">
                          Select an Assignment
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}