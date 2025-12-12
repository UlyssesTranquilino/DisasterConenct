import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { 
  Search, ChevronDown, MapPin, Users, Clock, X, 
  AlertCircle, CheckCircle, Heart, Plus, Upload, 
  User, LogIn, Building2, Link, Handshake, ChevronRight, 
  Network, CheckCircle2, Clock as ClockIcon, AlertTriangle
} from "lucide-react";
// Use the API service you already have
import { apiService } from "../../lib/api";
import { useSimpleToast } from "../../components/components/ui/SimpleToast";
import { useAuth } from "../../lib/auth";
import { ToastManager } from "../../components/components/ui/ToastNotification"; // Import the Toast Manager

// Define types locally since they're not in your API service
type HelpRequest = {
  id: string;
  title: string;
  organization: string;
  organizationId: string;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number };
  skillsRequired: string[];
  volunteersNeeded: number;
  volunteersAssigned: number;
  urgency: "High" | "Medium" | "Low";
  datePosted: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  status: "Open" | "Filled" | "Closed";
  estimatedDuration: string;
  requirements?: string[];
  // ✅ FIX APPLIED: Added missing property
  isCommunitySuggestion?: boolean; 
};

type Organization = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  type: string;
  status: string;
  joinedDate: string;
  tasksAssigned: number;
  tasksCompleted: number;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  logoUrl?: string;
};

type SuggestionStatus = "pending" | "approved" | "rejected" | "open" | "filled";

interface CommunitySuggestion {
  id: string;
  title: string;
  description: string;
  organization: string;
  organizationId: string;
  location: string;
  coordinates: { lat: number; lng: number };
  skillsRequired: string[];
  volunteersNeeded: number;
  volunteersAssigned: number;
  urgency: "High" | "Medium" | "Low";
  datePosted: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  status: SuggestionStatus;
  estimatedDuration: string;
  requirements: string[];
  suggestedBy: string;
  suggestedAt: string;
  isCommunitySuggestion: boolean;
}

interface ApplicationFormData {
  availability: string;
  skills: string;
  notes: string;
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

// Gradient background style
const cardGradientStyle = {
  background: "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case "High": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "Medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Low": return "bg-green-500/20 text-green-400 border-green-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

const getUrgencyIcon = (urgency: string) => {
  switch (urgency) {
    case "High": return <AlertCircle size={14} className="text-red-400" />;
    case "Medium": return <ClockIcon size={14} className="text-yellow-400" />;
    case "Low": return <ClockIcon size={14} className="text-green-400" />;
    default: return <ClockIcon size={14} className="text-gray-400" />;
  }
};

// Response Popup Component (Updated prop name: need -> helpRequest)
function ResponsePopup({ isOpen, onClose, onSubmit, helpRequest }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApplicationFormData) => void;
  helpRequest: HelpRequest | CommunitySuggestion; // Updated type
}) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    availability: "", skills: "", notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen || !helpRequest) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Apply to Volunteer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
          </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-gray-700/30 rounded-lg p-3">
            <h4 className="text-white font-medium text-sm mb-2">Opportunity Details:</h4>
            <p className="text-white text-sm font-medium">{helpRequest.title}</p>
            <p className="text-blue-400 text-xs mt-1">{helpRequest.organization}</p>
            <p className="text-gray-300 text-xs mt-1">{helpRequest.description}</p>
            <p className="text-gray-400 text-xs mt-1">📍 {helpRequest.location}</p>
            {helpRequest.isCommunitySuggestion && (
              <p className="text-green-400 text-xs mt-1">Community Suggestion</p>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-white text-sm font-medium mb-1 block">When are you available?*</label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select availability</option>
                <option value="immediately">Immediately</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="next_week">Next Week</option>
                <option value="flexible">Flexible Schedule</option>
              </select>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1 block">Relevant skills or experience*</label>
              <textarea
                value={formData.skills}
                onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="What skills do you have that are relevant to this opportunity?"
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1 block">Additional notes (optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any other information you'd like to share..."
                rows={2}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
            </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-500 text-white">
              Submit Application
            </Button>
          </div>
        </form>
      </div>
      </div>
  );
}

// Suggest Opportunity Popup (Remains unchanged)
function SuggestOpportunityPopup({ isOpen, onClose, onSuggestionSubmitted, currentUser }: {
  isOpen: boolean;
  onClose: () => void;
  onSuggestionSubmitted: () => void;
  currentUser: any;
}) {
  const [formData, setFormData] = useState({
    title: '', description: '', organization: '', location: '',
    skills: '', urgency: 'Medium' as "High" | "Medium" | "Low",
    volunteersNeeded: 1, contactInfo: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError, ToastContainer } = useSimpleToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
      const suggestion = {
        title: formData.title,
        description: formData.description,
        organization: formData.organization,
        organizationId: `community_${Date.now()}`,
        location: formData.location,
        coordinates: { lat: 0, lng: 0 },
        skillsRequired: skillsArray,
        volunteersNeeded: formData.volunteersNeeded,
        volunteersAssigned: 0,
        urgency: formData.urgency,
        datePosted: new Date().toISOString(),
        contactPerson: "Community Suggestion",
        contactPhone: formData.contactInfo,
        contactEmail: formData.contactInfo.includes('@') ? formData.contactInfo : '',
        status: "pending",
        estimatedDuration: "To be determined",
        requirements: [],
        suggestedBy: currentUser?.displayName || "Anonymous User",
        suggestedAt: new Date().toISOString(),
        isCommunitySuggestion: true
      };
      
      if (!currentUser) {
        toastError('Authentication Required', 'Please login to submit suggestions.');
        setSubmitting(false);
        return;
      }
      
      try {
        // Try to submit via API using the generic request method
        const response = await (apiService as any).request('/suggestions', {
          method: 'POST',
          body: JSON.stringify(suggestion)
        });
        
        if (response.success) {
          success('Suggestion Submitted!', 'Your suggestion has been submitted for review!');
          setFormData({ 
            title: '', description: '', organization: '', location: '', 
            skills: '', urgency: 'Medium', volunteersNeeded: 1, contactInfo: '' 
          });
          onSuggestionSubmitted();
          onClose();
        } else {
          throw new Error('API failed');
        }
      } catch (apiError) {
        // Fallback to localStorage
        saveSuggestionLocally(suggestion);
      }
      
    } catch (error) {
      console.error('Error:', error);
      toastError('Submission Error', 'Failed to submit suggestion.');
    } finally {
      setSubmitting(false);
    }
  };

  const saveSuggestionLocally = (suggestion: any) => {
    const savedSuggestions = JSON.parse(localStorage.getItem('communitySuggestions') || '[]');
    const newSuggestion = { ...suggestion, id: `local_${Date.now()}` };
    savedSuggestions.push(newSuggestion);
    localStorage.setItem('communitySuggestions', JSON.stringify(savedSuggestions));
    
    success('Suggestion Saved Locally', 'Your suggestion has been saved locally!');
    setFormData({ 
      title: '', description: '', organization: '', location: '', 
      skills: '', urgency: 'Medium', volunteersNeeded: 1, contactInfo: '' 
    });
    onSuggestionSubmitted();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 sticky top-0 bg-gray-800">
          <h3 className="text-lg font-semibold text-white">Suggest New Opportunity</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" disabled={submitting}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-white text-sm font-medium mb-1 block">Opportunity Title*</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Food Distribution Support"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1 block">Description*</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what volunteers will do..."
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white text-sm font-medium mb-1 block">Organization*</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({...formData, organization: e.target.value})}
                  placeholder="Organization name"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
              />
            </div>

              <div>
                <label className="text-white text-sm font-medium mb-1 block">Urgency*</label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({...formData, urgency: e.target.value as "High" | "Medium" | "Low"})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  required
                  disabled={submitting}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1 block">Location*</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Address or area"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1 block">Skills Needed (comma-separated)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                placeholder="e.g., First Aid, Construction, Bilingual"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white text-sm font-medium mb-1 block">Volunteers Needed*</label>
                <input
                  type="number"
                  min="1"
                  value={formData.volunteersNeeded}
                  onChange={(e) => setFormData({...formData, volunteersNeeded: parseInt(e.target.value) || 1})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  required
                  disabled={submitting}
              />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-1 block">Contact Info*</label>
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
                  placeholder="Email or phone"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Upload size={14} className="mr-1" />
                  Submit Suggestion
                </span>
              )}
            </Button>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}

export default function VolunteerNeedsPage() {
  const { currentUser, isLoading: authLoading, loginWithGoogle } = useAuth();
  
  // UPDATED STATE: Renamed needs -> helpRequests
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  
  const [communitySuggestions, setCommunitySuggestions] = useState<any[]>([]);
  const [linkedOrganizations, setLinkedOrganizations] = useState<any[]>([]);
  const [organizationLinks, setOrganizationLinks] = useState<OrganizationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  
  // UPDATED STATE: Renamed selectedNeed -> selectedRequest
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  
  const { success, error: toastError, ToastContainer } = useSimpleToast();
  
  // Initialize Toast Manager
  const { toast, ToastContainer: ToastNotificationContainer } = ToastManager();

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

  // Save organization links to localStorage
  const saveOrganizationLinks = (links: OrganizationLink[]) => {
    localStorage.setItem('volunteer_org_links', JSON.stringify(links));
    setOrganizationLinks(links);
  };

  // Handle linking request (Remains unchanged)
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
        
        // Use standard toast method
        toast.success('Organization Connected!', `You are now connected with ${orgName}. You'll see their opportunities first.`);
      }, 2000);
      
      // Use standard toast method for request sent
      toast.info('Link Request Sent', `Request sent to ${orgName}. Awaiting approval...`);
      
    } catch (error) {
      toast.error('Request Failed', 'Failed to send connection request. Please try again.');
    }
  };

  // Calculate organization stats (Updated usage)
  const organizationStats = {
    totalLinked: organizationLinks.filter(link => link.status === 'approved').length,
    pendingLinks: organizationLinks.filter(link => link.status === 'pending').length,
    activeNeedsFromLinked: helpRequests.filter(request => 
      organizationLinks.some(link => 
        link.status === 'approved' && link.organizationName === request.organization
      )
    ).length
  };

  // *****************************************************************
  // ** CRITICAL FIX: Ensure fetchAllData runs AFTER auth is complete **
  // *****************************************************************
  useEffect(() => {
    // Only fetch data if we are NOT currently loading authentication status
    // This prevents the immediate, unauthorized call on refresh.
    if (!authLoading) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // UPDATED API CALL: Fetch help requests using the new endpoint
      try {
        // Hitting the /volunteer/help-requests endpoint (Fixes 404 in VolunteerNeedsPage.tsx)
        const requestsData = await (apiService as any).request('/volunteer/help-requests'); 
        
        if (requestsData.success && requestsData.data) {
          setHelpRequests(requestsData.data);
        } else {
          setHelpRequests([]);
        }
      } catch (requestsError) {
        console.log("Could not fetch help requests:", requestsError);
        // 🛑 ERROR CHECK: This log is related to the 500 error from the backend.
        setError("Failed to load help requests. Check login status.");
        setHelpRequests([]);
      }
      
      // 2. Fetch linked organizations (using the new correct endpoint)
      try {
        if (currentUser) {
          // Hitting the /volunteer/organizations endpoint
          const orgsData = await (apiService as any).request('/volunteer/organizations');
          if (orgsData.success && orgsData.data) {
            setLinkedOrganizations(orgsData.data);
          } else {
            setLinkedOrganizations([]);
          }
        }
      } catch (orgsError) {
        console.log("Could not fetch organizations:", orgsError);
        setLinkedOrganizations([]);
      }
      
      // 3. Load community suggestions from localStorage (Remains unchanged)
      const savedSuggestions = JSON.parse(localStorage.getItem('communitySuggestions') || '[]');
      setCommunitySuggestions(savedSuggestions);
      
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Combine all opportunities (Updated usage)
  const allOpportunities = [
    // Explicitly set isCommunitySuggestion to false for API requests
    ...helpRequests.map((request: HelpRequest) => ({ ...request, isCommunitySuggestion: false })),
    ...communitySuggestions.map((suggestion: any) => ({
      ...suggestion,
      isCommunitySuggestion: true,
      status: suggestion.status === "filled" ? "Filled" : "Open"
    }))
  ];

  const filteredOpportunities = allOpportunities.filter((n: any) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || 
      (n.title && n.title.toLowerCase().includes(q)) || 
      (n.organization && n.organization.toLowerCase().includes(q));
    
    const matchesFilter = filter === "all" || 
      (filter === "high" && n.urgency === "High") ||
      (filter === "medium" && n.urgency === "Medium") ||
      (filter === "low" && n.urgency === "Low") ||
      (filter === "open" && n.status === "Open") ||
      (filter === "filled" && (n.status === "Filled" || (n.volunteersAssigned >= n.volunteersNeeded)));
    
    return matchesSearch && matchesFilter;
  });

  // UPDATED FUNCTION: handleRespondClick (Updated usage)
  const handleRespondClick = (request: HelpRequest | CommunitySuggestion) => {
    if (!currentUser) {
      toast.error('Login Required', 'Please login to apply for volunteer opportunities.');
      return;
    }
    
    setSelectedRequest(request);
    setIsResponseOpen(true);
  };

  // UPDATED FUNCTION: handleSubmitResponse (Updated usage)
  const handleSubmitResponse = async (responseData: ApplicationFormData) => {
    if (!selectedRequest) return;

    try {
      const isCommunitySuggestion = selectedRequest.isCommunitySuggestion;
      
      if (isCommunitySuggestion) {
        // Handle community suggestion locally
        const newSuggestions = communitySuggestions.map((s: any) => 
          s.id === selectedRequest.id 
            ? { ...s, volunteersAssigned: (s.volunteersAssigned || 0) + 1 }
            : s
        );
        setCommunitySuggestions(newSuggestions);
        localStorage.setItem('communitySuggestions', JSON.stringify(newSuggestions));
        
        // Use standard toast method with custom details
        toast.success('Interest Recorded!', `Your interest in "${selectedRequest.title}" has been recorded! The organization will contact you if needed.`);
        
      } else {
        // Use apiService for real help requests
        const requestData = {
          orgId: selectedRequest.organizationId,
          helpRequestId: selectedRequest.id, // Updated body parameter name
          ...responseData
        };
        
        try {
          // UPDATED API CALL: Use the new self-assign endpoint
          const response = await (apiService as any).request('/volunteer/self-assign', {
            method: 'POST',
            body: JSON.stringify(requestData)
          });
          
          if (response.success) {
            // Update local state
            setHelpRequests(prev => prev.map(request => 
              request.id === selectedRequest.id 
                ? { 
                    ...request, 
                    volunteersAssigned: (request.volunteersAssigned || 0) + 1,
                    status: (request.volunteersAssigned || 0) + 1 >= request.volunteersNeeded ? "Filled" : request.status
                  }
                : request
            ));
            
            // Use standard toast method with custom details
            toast.success('Application Submitted!', `Successfully applied to "${selectedRequest.title}" with ${selectedRequest.organization}! They will contact you soon.`);
          } else {
            throw new Error(response.message || "Failed to submit application");
          }
        } catch (apiError) {
          throw new Error("Failed to connect to server");
        }
      }
      
      setIsResponseOpen(false);
      setSelectedRequest(null);
      
    } catch (error: any) {
      console.error("Application error:", error);
      toast.error('Application Failed', error.message || 'Failed to submit application.');
      setIsResponseOpen(false);
      setSelectedRequest(null);
    }
  };

  const handleSuggestionSubmitted = () => {
    const savedSuggestions = JSON.parse(localStorage.getItem('communitySuggestions') || '[]');
    setCommunitySuggestions(savedSuggestions);
    
    // Use standard toast method
    toast.success('Suggestion Submitted!', 'Your opportunity suggestion has been submitted for review!');
  };

  const handleLoginClick = async () => {
    try {
      await loginWithGoogle();
      // We rely on the authLoading useEffect hook to call fetchAllData
      
      // Use standard toast method
      toast.success('Login Successful', 'Welcome back! You can now apply for volunteer opportunities.');
    } catch (error) {
      console.error("Login failed:", error);
      toast.error('Login Failed', 'Failed to login. Please try again.');
    }
  };

  const handleViewOrganizations = () => {
    window.location.href = '/volunteer/organizations';
  };

  // Check if opportunity is from linked organization
  const isFromLinkedOrganization = (need: any) => {
    return linkedOrganizations.some(org => 
      org.name === need.organization || 
      org.id === need.organizationId
    ) || organizationLinks.some(link => 
      link.status === 'approved' && link.organizationName === need.organization
    );
  };

  // Get icon component for metrics
  const getIconComponent = (iconName: string, size: number = 16) => {
    switch (iconName) {
      case "ClockIcon":
        return <ClockIcon size={size} />;
      case "CheckCircle":
        return <CheckCircle2 size={size} />;
      case "AlertTriangle":
        return <AlertTriangle size={size} />;
      case "Building2":
        return <Building2 size={size} />;
      case "Network":
        return <Network size={size} />;
      case "Handshake":
        return <Handshake size={size} />;
      default:
        return <ClockIcon size={size} />;
    }
  };

  // Calculate metrics for the needs page
  const calculatedMetrics = [
    {
      title: "Total Opportunities",
      value: allOpportunities.length.toString(),
      icon: "Network",
      color: "text-blue-400"
    },
    {
      title: "Urgent Requests", // Updated Title
      value: allOpportunities.filter((n: any) => n.urgency === "High").length.toString(),
      icon: "AlertTriangle",
      color: "text-red-400"
    },
    {
      title: "Linked Orgs",
      value: organizationStats.totalLinked.toString(),
      icon: "Building2",
      color: "text-purple-400"
    },
    {
      title: "Active from Linked",
      value: organizationStats.activeNeedsFromLinked.toString(),
      icon: "Handshake",
      color: "text-green-400"
    }
  ];

  if (authLoading || loading) {
    return (
      <div className="px-2 md:px-4 space-y-4 pb-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          <p className="text-white">Loading volunteer opportunities...</p>
        </div>
        </div>
    );
  }

  return (
    <div className="px-2 md:px-4 space-y-4 pb-6 min-h-screen">
      {/* Header with Search */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-lg font-semibold text-white">Available Volunteer Opportunities (Help Requests)</h1> {/* Updated text */}
          <p className="text-sm text-gray-400">Find and apply to help with current disaster relief requests</p> {/* Updated text */}
          
          {/* User Status */}
          <div className="flex items-center gap-2 mt-1">
            {currentUser ? (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                <User size={12} />
                <span>{currentUser.displayName}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                <AlertCircle size={12} />
                <span>Not logged in</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Login Button (when not logged in) */}
          {!currentUser && (
            <Button
              onClick={handleLoginClick}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xs h-8"
            >
              <LogIn size={14} className="mr-1" />
              Login to Volunteer
            </Button>
          )}

          {/* View Linked Organizations Button */}
          {currentUser && linkedOrganizations.length > 0 && (
            <Button
              onClick={handleViewOrganizations}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs h-8"
            >
              <Building2 size={14} className="mr-1" />
              My Organizations
            </Button>
          )}

          {/* Suggest Opportunity Button */}
          <Button
            onClick={() => setIsSuggestionOpen(true)}
            disabled={!currentUser}
            className={`text-white text-xs h-8 ${!currentUser ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
            title={!currentUser ? "Please login to suggest opportunities" : ""}
          >
            <Plus size={14} className="mr-1" />
            Suggest Opportunity
          </Button>

          {/* Search Bar */}
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-2 py-[5px]">
            <Search size={14} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none w-32 md:w-48"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-gray-900 border border-gray-700 rounded-lg px-3 py-[5px] text-sm text-white focus:outline-none focus:border-blue-500 w-48 pr-8"
            >
              <option value="all" className="bg-gray-800 text-white">All Opportunities</option>
              <option value="high" className="bg-gray-800 text-white">High Priority</option>
              <option value="medium" className="bg-gray-800 text-white">Medium Priority</option>
              <option value="low" className="bg-gray-800 text-white">Low Priority</option>
              <option value="open" className="bg-gray-800 text-white">Open Positions</option>
              <option value="filled" className="bg-gray-800 text-white">Filled Positions</option>
            </select>
            <ChevronDown size={14} className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 hover:bg-gray-600"
            onClick={fetchAllData}
            title="Refresh opportunities"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Organization Connection Status - Similar to Dashboard */}
      {(organizationStats.totalLinked > 0 || organizationStats.pendingLinks > 0) && (
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <Link size={16} className="text-purple-400" />
              </div>
            <div className="flex-1">
              <h3 className="text-white font-medium">Organization Connections</h3>
              <p className="text-purple-300 text-sm mt-1">
                {organizationStats.totalLinked > 0 && (
                  <>
                    Connected to {organizationStats.totalLinked} organization(s). 
                    {organizationStats.activeNeedsFromLinked > 0 && 
                      ` • ${organizationStats.activeNeedsFromLinked} opportunities from your connections`}
                    {organizationStats.pendingLinks > 0 && ` • ${organizationStats.pendingLinks} pending request(s)`}
                  </>
                )}
                {organizationStats.totalLinked === 0 && organizationStats.pendingLinks > 0 && (
                  <>You have {organizationStats.pendingLinks} pending connection request(s)</>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {organizationStats.pendingLinks > 0 && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs flex items-center">
                  <ClockIcon size={10} className="mr-1" />
                  {organizationStats.pendingLinks} Pending
                </span>
              )}
              {organizationStats.totalLinked > 0 && organizationStats.activeNeedsFromLinked > 0 && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center">
                  <Handshake size={10} className="mr-1" />
                  {organizationStats.activeNeedsFromLinked} Opportunities
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Connect Card (when no organizations linked) */}
      {organizationStats.totalLinked === 0 && !loading && currentUser && (
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
                    Link with organizations to see their opportunities first and receive direct assignments
                  </p>
                </div>
              </div>
              <Button
                onClick={() => window.location.href = '/volunteer/dashboard'}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-7 px-3"
              >
                <Handshake size={12} className="mr-1" />
                Connect Organizations
                <ChevronRight size={12} className="ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Login Required Banner */}
      {!currentUser && (
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <LogIn size={24} className="text-red-400" />
              </div>
            <div className="flex-1">
              <h3 className="text-white font-medium">Login Required to Volunteer</h3>
              <p className="text-red-300 text-sm mt-1">
                Please login with your volunteer account to apply for opportunities or suggest new ones.
              </p>
            </div>
            <Button
              onClick={handleLoginClick}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white"
            >
              <LogIn size={16} className="mr-2" />
              Login Now
            </Button>
          </div>
        </div>
      )}

      {/* Metrics Cards - Similar to Dashboard */}
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

      {/* Error State */}
      {error && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-yellow-400" />
            <div className="flex-1">
              <p className="text-yellow-400 text-sm">{error}</p>
            </div>
            <Button
              onClick={fetchAllData}
              className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs h-8"
            >
              Retry Connection
            </Button>
          </div>
        </div>
      )}

      {/* Needs List */}
      <Card className="border-0 flex-1 min-h-0 flex flex-col" style={cardGradientStyle}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b-0">
          <CardTitle className="text-sm font-medium text-white">
            Available Volunteer Opportunities (Help Requests)
          </CardTitle>
          <div className="text-xs text-neutral-400">
            {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'request' : 'requests'} found
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1 p-4">
            {filteredOpportunities.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center text-center py-12">
                <div className="text-neutral-600 mb-3">
                  <Search size={48} />
                </div>
                <p className="text-lg text-white font-medium mb-2">No volunteer opportunities yet</p>
                <p className="text-sm text-neutral-400 mb-6 max-w-md">
                  Be the first to suggest a volunteer opportunity! Help build our community response network.
                </p>
                <Button
                  onClick={() => setIsSuggestionOpen(true)}
                  className="text-sm h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                  disabled={!currentUser}
                  title={!currentUser ? "Please login to suggest opportunities" : ""}
                >
                  <Plus size={16} className="mr-2" />
                  Suggest First Opportunity
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOpportunities.map((opportunity: any) => {
                  const isLinked = isFromLinkedOrganization(opportunity);
                  
                  return (
                    <Card 
                      key={opportunity.id} 
                      className={`border ${opportunity.isCommunitySuggestion ? 'border-purple-500/30 bg-gradient-to-br from-purple-900/10 to-blue-900/10' : 
                                isLinked ? 'border-green-500/30 bg-gradient-to-br from-green-900/10 to-blue-900/10' : 
                                'border-blue-500/30 bg-gradient-to-br from-blue-900/10 to-gray-800/20'} hover:bg-gray-800/30 transition-all duration-200 flex flex-col`}
                    >
                      {/* Linked Organization Badge */}
                      {isLinked && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-2 py-1">
                            <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                              <Link size={10} />
                              Linked
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-sm font-medium text-white flex-1 pr-8">
                            {opportunity.title}
                          </CardTitle>
                          <div className="flex items-center space-x-1">
                            {getUrgencyIcon(opportunity.urgency)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(opportunity.urgency)}`}>
                              {opportunity.urgency}
                            </span>
                          </div>
                        </div>
                        <p className="text-blue-400 text-xs mt-1">{opportunity.organization}</p>
                        {opportunity.isCommunitySuggestion && (
                          <p className="text-purple-400 text-xs mt-1">Community Suggestion</p>
                        )}
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="text-sm text-neutral-300 mb-3 line-clamp-3">
                          {opportunity.description}
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <MapPin size={12} />
                            <span className="truncate">{opportunity.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <Users size={12} />
                            <span>
                              {opportunity.volunteersAssigned || 0}/{opportunity.volunteersNeeded} volunteers • {opportunity.estimatedDuration}
                            </span>
                          </div>
                        </div>

                        <Button 
                          onClick={() => handleRespondClick(opportunity)}
                          disabled={opportunity.status === "Filled" || opportunity.volunteersAssigned >= opportunity.volunteersNeeded || !currentUser}
                          className={`w-full text-white text-xs h-8 ${
                            opportunity.status === "Filled" || opportunity.volunteersAssigned >= opportunity.volunteersNeeded
                              ? "bg-gray-600 cursor-not-allowed"
                              : !currentUser
                              ? "bg-gray-700 cursor-not-allowed"
                              : opportunity.isCommunitySuggestion
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                              : isLinked
                              ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                              : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
                          }`}
                          title={!currentUser ? "Please login to apply" : ""}
                        >
                          {opportunity.status === "Filled" || opportunity.volunteersAssigned >= opportunity.volunteersNeeded ? (
                            <span className="flex items-center justify-center gap-1">
                              <CheckCircle size={10} />
                              Position Filled
                            </span>
                          ) : !currentUser ? (
                            <span className="flex items-center justify-center gap-1">
                              <LogIn size={10} />
                              Login to Apply
                            </span>
                          ) : opportunity.isCommunitySuggestion ? (
                            <span className="flex items-center justify-center gap-1">
                              <Heart size={10} />
                              Express Interest
                            </span>
                          ) : isLinked ? (
                            <span className="flex items-center justify-center gap-1">
                              <CheckCircle size={10} />
                              Apply to Linked Org
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1">
                              <CheckCircle size={10} />
                              Apply to Help
                            </span>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Response Popup */}
      <ResponsePopup
        isOpen={isResponseOpen}
        onClose={() => setIsResponseOpen(false)}
        onSubmit={handleSubmitResponse}
        helpRequest={selectedRequest} // Updated prop name
      />

      {/* Suggest Opportunity Popup */}
      <SuggestOpportunityPopup
        isOpen={isSuggestionOpen}
        onClose={() => setIsSuggestionOpen(false)}
        onSuggestionSubmitted={handleSuggestionSubmitted}
        currentUser={currentUser}
      />
      
      {/* Toast Container from ToastManager */}
      <ToastNotificationContainer />
      
      {/* Old Toast Container (for backward compatibility) */}
      <ToastContainer />
    </div>
  );
}