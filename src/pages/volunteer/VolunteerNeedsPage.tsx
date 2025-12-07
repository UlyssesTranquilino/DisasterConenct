import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { 
  Search, Bell, ChevronDown, MapPin, Users, Clock, X, Phone, Mail, 
  AlertCircle, CheckCircle, Star, Flame, Shield, Heart, Plus, Upload, 
  User, Globe, Target, Zap, LogIn, Building2, Network, Link, ExternalLink 
} from "lucide-react";
import { apiService, type Need, type Organization } from "../../lib/api"; 
import { useSimpleToast } from "../../components/components/ui/SimpleToast";
import { useAuth } from "../../lib/auth";

// Gradient background style for cards
const cardGradientStyle = {
  background: "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

interface ApplicationFormData {
  availability: string;
  skills: string;
  notes: string;
}

interface ResponsePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApplicationFormData) => void;
  need: Need | null;
  volunteerName: string;
  volunteerContact: string;
}

// Update status type to include "filled"
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

// Response Popup Component
function ResponsePopup({ isOpen, onClose, onSubmit, need, volunteerName, volunteerContact }: ResponsePopupProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    availability: "",
    skills: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof ApplicationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen || !need) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Apply to Volunteer</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Need Details */}
          <div className="bg-gray-700/30 rounded-lg p-3">
            <h4 className="text-white font-medium text-sm mb-2">Opportunity Details:</h4>
            <p className="text-white text-sm font-medium">{need.title}</p>
            <p className="text-blue-400 text-xs mt-1">{need.organization}</p>
            <p className="text-gray-300 text-xs mt-1">{need.description}</p>
            <p className="text-gray-400 text-xs mt-1">📍 {need.location}</p>
            {(need as any).isCommunitySuggestion && (
              <p className="text-green-400 text-xs mt-1">Community Suggestion</p>
            )}
          </div>

          {/* Volunteer Information (display only) */}
          <div className="bg-gray-700/30 rounded-lg p-3">
            <h4 className="text-white font-medium text-sm mb-2">Your Information:</h4>
            <div className="space-y-2">
              <div>
                <label className="text-gray-400 text-xs block">Full Name</label>
                <div className="text-white text-sm">{volunteerName}</div>
              </div>
              <div>
                <label className="text-gray-400 text-xs block">Contact Information</label>
                <div className="text-white text-sm">{volunteerContact}</div>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-2 italic">
              This information is from your profile.
            </p>
          </div>

          {/* Additional Information Needed */}
          <div className="space-y-3">
            <div>
              <label className="text-white text-sm font-medium mb-1 block">When are you available?*</label>
              <select
                value={formData.availability}
                onChange={(e) => handleChange('availability', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                required
              >
                <option value="" className="bg-gray-800">Select availability</option>
                <option value="immediately" className="bg-gray-800">Immediately</option>
                <option value="today" className="bg-gray-800">Today</option>
                <option value="this_week" className="bg-gray-800">This Week</option>
                <option value="next_week" className="bg-gray-800">Next Week</option>
                <option value="weekends" className="bg-gray-800">Weekends Only</option>
                <option value="evenings" className="bg-gray-800">Evenings Only</option>
                <option value="flexible" className="bg-gray-800">Flexible Schedule</option>
              </select>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1 block">Relevant skills or experience*</label>
              <textarea
                value={formData.skills}
                onChange={(e) => handleChange('skills', e.target.value)}
                placeholder="What skills do you have that are relevant to this opportunity?"
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                required
              />
              <p className="text-gray-400 text-xs mt-1">
                Examples: First Aid certified, bilingual, construction experience, etc.
              </p>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1 block">Additional notes (optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any other information you'd like to share..."
                rows={2}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-500 text-white"
            >
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Enhanced Suggest Opportunity Popup with Firebase submission
function SuggestOpportunityPopup({ isOpen, onClose, volunteerName, onSuggestionSubmitted, currentUser }: {
  isOpen: boolean;
  onClose: () => void;
  volunteerName: string;
  onSuggestionSubmitted: () => void;
  currentUser: any;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organization: '',
    location: '',
    skills: '',
    urgency: 'Medium' as "High" | "Medium" | "Low",
    volunteersNeeded: 1,
    contactInfo: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError, ToastContainer } = useSimpleToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      
      // Create suggestion object
      const suggestion: Omit<CommunitySuggestion, 'id'> = {
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
        suggestedBy: volunteerName,
        suggestedAt: new Date().toISOString(),
        isCommunitySuggestion: true
      };
      
      // Check if user is authenticated using currentUser from auth context
      if (!currentUser) {
        toastError('Authentication Required', 'Please login to submit suggestions.');
        setSubmitting(false);
        return;
      }
      
      // Get token from localStorage (set by your auth context)
      const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
      
      if (!token) {
        toastError('Authentication Error', 'Please login again.');
        setSubmitting(false);
        return;
      }
      
      // Try to save to your backend
      try {
        const response = await fetch('https://disasterconnect-api.vercel.app/api/suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(suggestion),
        });
        
        if (response.ok) {
          success(
            'Suggestion Submitted!',
            `✅ Your suggestion "${formData.title}" has been submitted for review!\n\n` +
            `Organization: ${formData.organization}\n` +
            `It will be added to the opportunities list once approved.`
          );
          
          // Reset form
          setFormData({
            title: '',
            description: '',
            organization: '',
            location: '',
            skills: '',
            urgency: 'Medium',
            volunteersNeeded: 1,
            contactInfo: '',
          });
          
          onSuggestionSubmitted(); // Refresh the list
          onClose();
        } else {
          // Backend failed - save locally
          saveSuggestionLocally(suggestion);
        }
      } catch (backendError) {
        console.warn("Backend unavailable, saving locally:", backendError);
        saveSuggestionLocally(suggestion);
      }
      
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toastError('Submission Error', 'Failed to submit suggestion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const saveSuggestionLocally = (suggestion: Omit<CommunitySuggestion, 'id'>) => {
    // Save to localStorage as fallback
    const savedSuggestions = JSON.parse(localStorage.getItem('communitySuggestions') || '[]');
    const newSuggestion: CommunitySuggestion = {
      ...suggestion,
      id: `local_${Date.now()}`,
    };
    savedSuggestions.push(newSuggestion);
    localStorage.setItem('communitySuggestions', JSON.stringify(savedSuggestions));
    
    success(
      'Suggestion Saved Locally',
      `✅ Your suggestion "${formData.title}" has been saved!\n\n` +
      `Organization: ${formData.organization}\n` +
      `Note: Backend is currently unavailable. Your suggestion is saved locally and will sync when possible.`
    );
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      organization: '',
      location: '',
      skills: '',
      urgency: 'Medium',
      volunteersNeeded: 1,
      contactInfo: '',
    });
    
    onSuggestionSubmitted(); // Refresh the list
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 sticky top-0 bg-gray-800">
          <h3 className="text-lg font-semibold text-white">Suggest New Opportunity</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={submitting}
          >
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
                disabled={submitting}
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
                disabled={submitting}
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
                  disabled={submitting}
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
                  <option value="Low" className="bg-gray-800">Low</option>
                  <option value="Medium" className="bg-gray-800">Medium</option>
                  <option value="High" className="bg-gray-800">High</option>
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
                disabled={submitting}
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
              <p className="text-gray-400 text-xs mt-1">Leave blank if no specific skills required</p>
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

interface StatsMetric {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case "High":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "Medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Low":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

const getUrgencyIcon = (urgency: string) => {
  switch (urgency) {
    case "High":
      return <AlertCircle size={14} className="text-red-400" />;
    case "Medium":
      return <Clock size={14} className="text-yellow-400" />;
    case "Low":
      return <Clock size={14} className="text-green-400" />;
    default:
      return <Clock size={14} className="text-gray-400" />;
  }
};

export default function VolunteerNeedsPage() {
  const { currentUser, isLoading: authLoading, loginWithGoogle } = useAuth();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [communitySuggestions, setCommunitySuggestions] = useState<CommunitySuggestion[]>([]);
  const [linkedOrganizations, setLinkedOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  // Use real user data from auth context
  const volunteerName = currentUser?.displayName || "Guest User";
  const volunteerContact = currentUser?.email || "Please login to see contact info";
  const hasVolunteerRole = currentUser?.roles?.includes("volunteer") || false;
  
  // Initialize toast
  const { success, error: toastError, ToastContainer } = useSimpleToast();

  // Fetch needs from API and community suggestions
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching volunteer opportunities...");
      
      // Check backend status
      await checkBackendStatus();
      
      // Try to fetch from backend API
      try {
        const response = await apiService.getNeeds();
        
        if (response.success && response.data) {
          const apiNeeds = response.data;
          console.log("Real API needs:", apiNeeds);
          setNeeds(apiNeeds);
        }
      } catch (apiError) {
        console.log("Backend API unavailable, using empty needs");
        setNeeds([]);
      }
      
      // Load community suggestions from localStorage
      loadCommunitySuggestions();
      
      // Load linked organizations
      await loadLinkedOrganizations();
      
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to load data. Showing community suggestions only.");
      loadCommunitySuggestions();
    } finally {
      setLoading(false);
    }
  };

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('https://disasterconnect-api.vercel.app/api/health');
      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      setBackendStatus('offline');
    }
  };

  const loadCommunitySuggestions = () => {
    const savedSuggestions = JSON.parse(localStorage.getItem('communitySuggestions') || '[]');
    console.log("Loaded community suggestions:", savedSuggestions);
    setCommunitySuggestions(savedSuggestions);
  };

  const loadLinkedOrganizations = async () => {
    try {
      if (!currentUser) return;
      
      const orgsResponse = await apiService.getVolunteerOrganizations();
      if (orgsResponse.success && orgsResponse.data) {
        setLinkedOrganizations(orgsResponse.data);
      }
    } catch (error) {
      console.log("Could not load linked organizations:", error);
      // Sample organizations for demonstration
      setLinkedOrganizations([
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
          phone: "+63 2 8851 3000",
          address: "16th Floor, Pacific Star Building, Makati",
          description: "United Nations agency fighting hunger worldwide",
          type: "UN Agency",
          status: 'Active',
          joinedDate: "2024-01-15",
          tasksAssigned: 12,
          tasksCompleted: 8,
          contactPerson: "John Smith",
          contactEmail: "john.smith@wfp.org",
          contactPhone: "+63 917 987 6543",
          website: "https://www.wfp.org/countries/philippines",
          logoUrl: "https://logo.clearbit.com/wfp.org"
        }
      ]);
    }
  };

  // Combine all opportunities: real API data + community suggestions
  const allOpportunities = [
    ...needs,
    ...communitySuggestions.map(suggestion => ({
      ...suggestion,
      id: suggestion.id,
      title: suggestion.title,
      organization: suggestion.organization,
      organizationId: suggestion.organizationId,
      description: suggestion.description,
      location: suggestion.location,
      coordinates: suggestion.coordinates,
      skillsRequired: suggestion.skillsRequired,
      volunteersNeeded: suggestion.volunteersNeeded,
      volunteersAssigned: suggestion.volunteersAssigned,
      urgency: suggestion.urgency,
      datePosted: suggestion.datePosted,
      contactPerson: suggestion.contactPerson,
      contactPhone: suggestion.contactPhone,
      contactEmail: suggestion.contactEmail,
      // Convert status to match Need type
      status: (suggestion.status === "filled" ? "Filled" : 
               suggestion.status === "open" ? "Open" : 
               "Open") as "Open" | "Filled" | "Closed",
      estimatedDuration: suggestion.estimatedDuration,
      requirements: suggestion.requirements,
      isCommunitySuggestion: true,
      suggestedBy: suggestion.suggestedBy,
    }))
  ];

  const filteredOpportunities = allOpportunities.filter((n) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.organization.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.skillsRequired?.some(skill => skill.toLowerCase().includes(q));
    
    const matchesFilter = filter === "all" || 
      (filter === "high" && n.urgency === "High") ||
      (filter === "medium" && n.urgency === "Medium") ||
      (filter === "low" && n.urgency === "Low") ||
      (filter === "open" && n.status === "Open") ||
      (filter === "filled" && (n.status === "Filled" || n.volunteersAssigned >= n.volunteersNeeded)) ||
      (filter === "pending" && (n as any).isCommunitySuggestion && communitySuggestions.find(s => s.id === n.id)?.status === "pending");
    
    return matchesSearch && matchesFilter;
  });

  // Enhanced stats metrics with organization integration AND volunteers needed count
  const statsMetrics: StatsMetric[] = [
    {
      title: "Total Opportunities",
      value: allOpportunities.length.toString(),
      icon: <Target size={18} className="text-blue-400" />
    },
    {
      title: "Linked Organizations",
      value: linkedOrganizations.length.toString(),
      icon: <Building2 size={18} className="text-purple-400" />
    },
    {
      title: "Community Suggestions",
      value: communitySuggestions.length.toString(),
      icon: <Heart size={18} className="text-green-400" />
    },
    {
      title: "Volunteers Needed",
      value: allOpportunities.reduce((sum, need) => sum + (need.volunteersNeeded - (need.volunteersAssigned || 0)), 0).toString(),
      icon: <Users size={18} className="text-orange-400" />
    }
  ];

  const handleRespondClick = (need: Need) => {
    // Check authentication before opening response popup
    if (!currentUser) {
      toastError(
        'Login Required',
        'Please login to apply for volunteer opportunities.\n\n' +
        'You need a volunteer account to submit applications.'
      );
      return;
    }
    
    // Check if user has volunteer role
    if (!hasVolunteerRole) {
      toastError(
        'Volunteer Role Required',
        'Your account does not have volunteer privileges.\n\n' +
        'Please update your profile to include volunteer role.'
      );
      return;
    }
    
    setSelectedNeed(need);
    setIsResponseOpen(true);
  };

  const handleCloseResponse = () => {
    setIsResponseOpen(false);
    setSelectedNeed(null);
  };

  const handleSubmitResponse = async (responseData: ApplicationFormData) => {
    if (!selectedNeed) return;

    try {
      console.log("=== SUBMISSION DEBUG ===");
      console.log("1. Selected Need:", selectedNeed);
      
      // Check authentication
      if (!currentUser) {
        toastError('Authentication Required', 'Please login to submit applications.');
        return;
      }
      
      // Check volunteer role
      if (!hasVolunteerRole) {
        toastError('Volunteer Role Required', 'Your account does not have volunteer privileges.');
        return;
      }
      
      // Get token from auth context storage
      const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
      
      if (!token) {
        toastError('Authentication Error', 'Please login again.');
        return;
      }
      
      const isCommunitySuggestion = (selectedNeed as any).isCommunitySuggestion;
      
      if (isCommunitySuggestion) {
        // Find the original community suggestion
        const originalSuggestion = communitySuggestions.find(s => s.id === selectedNeed.id);
        
        if (!originalSuggestion) {
          toastError('Error', 'Suggestion not found.');
          handleCloseResponse();
          return;
        }
        
        // Handle community suggestion application
        success(
          'Interest Recorded',
          `📝 Your interest in "${selectedNeed.title}" has been recorded!\n\n` +
          `Organization: ${selectedNeed.organization}\n` +
          `Contact: ${selectedNeed.contactEmail || selectedNeed.contactPhone}\n\n` +
          `This is a community-suggested opportunity. The organizer will contact you directly.\n\n` +
          `Thank you for volunteering!`
        );
        
        // Calculate new volunteer count
        const newVolunteerCount = (originalSuggestion.volunteersAssigned || 0) + 1;
        const isFilled = newVolunteerCount >= originalSuggestion.volunteersNeeded;
        
        // Update community suggestions state
        setCommunitySuggestions(prev => prev.map(suggestion => 
          suggestion.id === selectedNeed.id 
            ? { 
                ...suggestion, 
                volunteersAssigned: newVolunteerCount,
                status: isFilled ? "filled" : suggestion.status
              }
            : suggestion
        ));
        
        // Save updated suggestions to localStorage
        const updatedSuggestions = communitySuggestions.map(suggestion => 
          suggestion.id === selectedNeed.id 
            ? { 
                ...suggestion, 
                volunteersAssigned: newVolunteerCount,
                status: isFilled ? "filled" : suggestion.status
              }
            : suggestion
        );
        localStorage.setItem('communitySuggestions', JSON.stringify(updatedSuggestions));
        
        handleCloseResponse();
        return;
      }
      
      // For real API needs (not community suggestions)
      const requestData = {
        orgId: selectedNeed.organizationId,
        needId: selectedNeed.id
      };
      
      console.log("2. Request data:", requestData);
      console.log("3. Authentication token:", token.substring(0, 20) + '...');
      
      // Try the real API
      console.log("4. Calling /volunteer/self-assign...");
      
      // Use direct fetch to see exact error
      const response = await fetch('https://disasterconnect-api.vercel.app/api/volunteer/self-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });
      
      console.log("5. Response status:", response.status);
      
      const responseText = await response.text();
      console.log("7. Response text:", responseText);
      
      let apiResponse;
      try {
        apiResponse = JSON.parse(responseText);
        console.log("8. Parsed response:", apiResponse);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
      }
      
      if (response.ok) {
        // Success
        setNeeds(prev => prev.map(need => 
          need.id === selectedNeed.id 
            ? { 
                ...need, 
                volunteersAssigned: (need.volunteersAssigned || 0) + 1,
                status: (need.volunteersAssigned || 0) + 1 >= need.volunteersNeeded ? "Filled" : need.status
              }
            : need
        ));

        success(
          'Application Submitted!',
          `✅ Successfully applied to "${selectedNeed.title}"!\n\n` +
          `Organization: ${selectedNeed.organization}\n` +
          `They will contact you at: ${volunteerContact}\n\n` +
          `Thank you for volunteering!`
        );
        
      } else {
        // API error
        console.error("API Error:", apiResponse);
        toastError(
          'Application Failed',
          `Server error: ${apiResponse?.message || response.statusText}\n\n` +
          `Please try again or contact support.`
        );
      }
      
      console.log("=== END SUBMISSION DEBUG ===");
      
      handleCloseResponse();
      
    } catch (error) {
      console.error("Network error:", error);
      toastError(
        'Connection Error',
        'Failed to connect to the server. Please check your internet connection.'
      );
      handleCloseResponse();
    }
  };

  const handleSuggestionSubmitted = () => {
    // Refresh community suggestions
    loadCommunitySuggestions();
  };

  const handleLoginClick = async () => {
    try {
      await loginWithGoogle();
      // Refresh organizations after login
      await loadLinkedOrganizations();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleViewOrganizations = () => {
    window.location.href = '/volunteer/organizations';
  };

  // Check if opportunity is from linked organization
  const isFromLinkedOrganization = (need: Need) => {
    return linkedOrganizations.some(org => 
      org.name === need.organization || 
      org.id === (need as any).organizationId
    );
  };

  // Combined loading state
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
          <h1 className="text-lg font-semibold text-white">Available Volunteer Opportunities</h1>
          <p className="text-sm text-gray-400">Find and apply to help with current needs</p>
          
          {/* User Status */}
          <div className="flex items-center gap-2 mt-1">
            {currentUser ? (
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${hasVolunteerRole ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                <User size={12} />
                <span>{currentUser.displayName}</span>
                {hasVolunteerRole ? (
                  <span className="ml-1">✓ Volunteer</span>
                ) : (
                  <span className="ml-1 text-yellow-300">(No volunteer role)</span>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
                <AlertCircle size={12} />
                <span>Not logged in</span>
              </div>
            )}
            
            {/* Backend Status */}
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${backendStatus === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              <div className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span>Backend: {backendStatus === 'online' ? 'Connected' : 'Community Mode'}</span>
            </div>
            
            {/* Linked Organizations Count */}
            {currentUser && linkedOrganizations.length > 0 && (
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400`}>
                <Building2 size={12} />
                <span>{linkedOrganizations.length} linked organizations</span>
              </div>
            )}
          </div>
          
          {/* Community Suggestions Count */}
          {communitySuggestions.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <Heart size={12} className="text-purple-400" />
              <span className="text-xs text-purple-400">{communitySuggestions.length} community suggestions</span>
            </div>
          )}
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
              <option value="pending" className="bg-gray-800 text-white">Community Suggestions</option>
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
                You can browse opportunities below, but login is required to take action.
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

      {/* Volunteer Role Required Banner */}
      {currentUser && !hasVolunteerRole && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-lg">
              <Shield size={24} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium">Volunteer Role Required</h3>
              <p className="text-yellow-300 text-sm mt-1">
                Your account is logged in but doesn't have volunteer privileges. Please update your profile
                to include volunteer role to apply for opportunities.
              </p>
            </div>
            <Button
              onClick={() => window.location.href = '/profile'}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white"
            >
              <User size={16} className="mr-2" />
              Update Profile
            </Button>
          </div>
        </div>
      )}

      {/* Welcome Banner for Empty Database */}
      {needs.length === 0 && communitySuggestions.length === 0 && (
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Globe size={24} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium">Welcome to Community Volunteer Hub!</h3>
              <p className="text-blue-300 text-sm mt-1">
                The database is currently empty. Be the first to suggest a volunteer opportunity!
                Your suggestions will help build our community response network.
              </p>
            </div>
            <Button
              onClick={() => setIsSuggestionOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white"
              disabled={!currentUser}
              title={!currentUser ? "Please login to suggest opportunities" : ""}
            >
              <Plus size={16} className="mr-2" />
              Suggest First Opportunity
            </Button>
          </div>
        </div>
      )}

      {/* Linked Organizations Banner */}
      {currentUser && linkedOrganizations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-purple-400" />
            <div className="flex-1">
              <p className="text-purple-400 text-sm">
                You're linked to {linkedOrganizations.length} organization{linkedOrganizations.length !== 1 ? 's' : ''}. 
                Opportunities from these organizations are highlighted below.
              </p>
            </div>
            <Button
              onClick={handleViewOrganizations}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-8"
            >
              View All
            </Button>
          </div>
        </div>
      )}

      {/* Community Suggestions Notice */}
      {communitySuggestions.length > 0 && (
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-purple-400" />
            <div className="flex-1">
              <p className="text-purple-400 text-sm">
                Showing {communitySuggestions.length} community suggestions. These are opportunities suggested by users like you!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-yellow-400" />
            <div className="flex-1">
              <p className="text-yellow-400 text-sm">{error}</p>
              <p className="text-yellow-300/80 text-xs mt-1">
                Community suggestions are saved locally and will sync when backend is available.
              </p>
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

      {/* Stats Row */}
      {allOpportunities.length > 0 && (
        <div className="flex justify-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl">
            {statsMetrics.map((metric, index) => (
              <Card key={index} className="border-0" style={cardGradientStyle}>
                <CardContent className="text-center p-3">
                  <div className="flex justify-center mb-1">
                    {metric.icon}
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
      )}

      {/* Needs List */}
      <Card className="border-0 flex-1 min-h-0 flex flex-col" style={cardGradientStyle}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b-0">
          <CardTitle className="text-sm font-medium text-white">
            Available Volunteer Opportunities
          </CardTitle>
          <div className="text-xs text-neutral-400">
            {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'} found • 
            <span className="text-green-400 ml-1">
              {allOpportunities.filter(n => n.status === "Open" || (n as any).status === "open").length} open
            </span>
            {currentUser && linkedOrganizations.length > 0 && (
              <span className="text-purple-400 ml-2">
                • {allOpportunities.filter(isFromLinkedOrganization).length} from your organizations
              </span>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1 p-4">
            {allOpportunities.length === 0 && !loading ? (
              <div className="col-span-full flex flex-col items-center justify-center text-center py-12">
                <div className="text-neutral-600 mb-3">
                  <Search size={48} />
                </div>
                <p className="text-lg text-white font-medium mb-2">No volunteer opportunities yet</p>
                <p className="text-sm text-neutral-400 mb-6 max-w-md">
                  Be the first to suggest a volunteer opportunity! Help build our community response network by suggesting needs in your area.
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
                {filteredOpportunities.map((need) => {
                  const isCommunitySuggestion = (need as any).isCommunitySuggestion;
                  const originalSuggestion = isCommunitySuggestion 
                    ? communitySuggestions.find(s => s.id === need.id)
                    : null;
                  const suggestionStatus = originalSuggestion?.status;
                  const displayStatus = isCommunitySuggestion 
                    ? (suggestionStatus === "filled" ? "Filled" : "Open")
                    : need.status;
                  const isLinked = isFromLinkedOrganization(need);
                  
                  return (
                    <Card 
                      key={need.id} 
                      className={`border ${isCommunitySuggestion ? 'border-purple-500/30 bg-gradient-to-br from-purple-900/10 to-blue-900/10' : 
                                isLinked ? 'border-green-500/30 bg-gradient-to-br from-green-900/10 to-blue-900/10' : 
                                'border-blue-500/30 bg-gradient-to-br from-blue-900/10 to-gray-800/20'} hover:bg-gray-800/30 transition-all duration-200 flex flex-col min-h-96`}
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
                            {need.title}
                          </CardTitle>
                          <div className="flex items-center space-x-1">
                            {getUrgencyIcon(need.urgency)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(need.urgency)}`}>
                              {need.urgency}
                            </span>
                          </div>
                        </div>
                        <p className="text-blue-400 text-xs mt-1">{need.organization}</p>
                        {isCommunitySuggestion && originalSuggestion && (
                          <p className="text-purple-400 text-xs mt-1">
                            Suggested by: {originalSuggestion.suggestedBy || "Community Member"}
                            {originalSuggestion.status === "pending" && (
                              <span className="ml-2 px-1 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                Pending Review
                              </span>
                            )}
                          </p>
                        )}
                      </CardHeader>

                      <CardContent className="pt-0 flex-1 flex flex-col">
                        <div className="text-sm text-neutral-300 mb-3 line-clamp-3 flex-1">
                          {need.description}
                        </div>
                        
                        {/* Additional Info */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <MapPin size={12} />
                            <span className="truncate">{need.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <Users size={12} />
                            <span>
                              {need.volunteersAssigned || 0}/{need.volunteersNeeded} volunteers • {need.estimatedDuration}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <Clock size={12} />
                            <span>Posted: {new Date(need.datePosted).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Skills Required */}
                        {need.skillsRequired && need.skillsRequired.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-neutral-400 mb-1">Skills Required:</p>
                            <div className="flex flex-wrap gap-1">
                              {need.skillsRequired.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                        </div>
                        )}

                        {/* Requirements */}
                        {need.requirements && need.requirements.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-neutral-400 mb-1">Requirements:</p>
                            <div className="flex flex-wrap gap-1">
                              {need.requirements.map((req, index) => (
                                <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                                  {req}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Action Button */}
                        <div className="mt-auto">
                          <Button 
                            onClick={() => handleRespondClick(need)}
                            disabled={displayStatus === "Filled" || need.volunteersAssigned >= need.volunteersNeeded || !currentUser || !hasVolunteerRole}
                            className={`w-full text-white text-xs h-8 ${
                              displayStatus === "Filled" || need.volunteersAssigned >= need.volunteersNeeded
                                ? "bg-gray-600 cursor-not-allowed"
                                : !currentUser || !hasVolunteerRole
                                ? "bg-gray-700 cursor-not-allowed"
                                : isCommunitySuggestion
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                                : isLinked
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                                : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
                            }`}
                            title={!currentUser ? "Please login to apply" : !hasVolunteerRole ? "Update profile to volunteer role" : ""}
                          >
                            {displayStatus === "Filled" || need.volunteersAssigned >= need.volunteersNeeded ? (
                              <span className="flex items-center justify-center gap-1">
                                <CheckCircle size={10} />
                                Position Filled
                              </span>
                            ) : !currentUser ? (
                              <span className="flex items-center justify-center gap-1">
                                <LogIn size={10} />
                                Login to Apply
                              </span>
                            ) : !hasVolunteerRole ? (
                              <span className="flex items-center justify-center gap-1">
                                <Shield size={10} />
                                Need Volunteer Role
                              </span>
                            ) : isCommunitySuggestion ? (
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
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {filteredOpportunities.length === 0 && allOpportunities.length > 0 && (
              <div className="col-span-full flex flex-col items-center justify-center text-center py-12">
                <div className="text-neutral-600 mb-3">
                  <Search size={32} />
                </div>
                <p className="text-sm text-neutral-400 font-medium mb-1">
                  No opportunities found
                </p>
                <p className="text-xs text-neutral-500">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  className="mt-4 text-xs h-8"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Response Popup */}
      <ResponsePopup
        isOpen={isResponseOpen}
        onClose={handleCloseResponse}
        onSubmit={handleSubmitResponse}
        need={selectedNeed}
        volunteerName={volunteerName}
        volunteerContact={volunteerContact}
      />

      {/* Suggest Opportunity Popup */}
      <SuggestOpportunityPopup
        isOpen={isSuggestionOpen}
        onClose={() => setIsSuggestionOpen(false)}
        volunteerName={volunteerName}
        onSuggestionSubmitted={handleSuggestionSubmitted}
        currentUser={currentUser}
      />
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}