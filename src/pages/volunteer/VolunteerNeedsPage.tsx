import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Search, Bell, ChevronDown, MapPin, Users, Clock, X, Phone, Mail, AlertCircle } from "lucide-react";

// Gradient background style for cards (same as dashboard)
const cardGradientStyle = {
  background: "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

// Define proper TypeScript interfaces based on corrected schema
interface Need {
  id: number;
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
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  status: "Open" | "Filled" | "Closed";
  estimatedDuration: string;
  requirements?: string[];
}

interface ApplicationFormData {
  name: string;
  contact: string;
  availability: string;
  skills: string;
  notes: string;
}

interface ResponsePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApplicationFormData) => void;
  need: Need | null;
}

// Complete mock data based on corrected schema
const extendedMockNeeds: Need[] = [
  {
    id: 1,
    title: "Medical Support at Evacuation Center",
    organization: "Red Cross Philippines",
    organizationId: "org_redcross_ph",
    description: "Provide basic medical assistance and first aid to evacuees at Quezon City Memorial Center. Volunteers with medical background preferred.",
    location: "Quezon City Memorial Center",
    coordinates: { lat: 14.6506, lng: 121.0500 },
    skillsRequired: ["First Aid", "CPR", "Emergency Response", "Medical Background"],
    volunteersNeeded: 3,
    volunteersAssigned: 1,
    urgency: "High",
    datePosted: "2024-01-10",
    contactPerson: "Dr. Maria Santos",
    contactPhone: "+63 912 345 6789",
    contactEmail: "msantos@redcross.org.ph",
    status: "Open",
    estimatedDuration: "8 hours",
    requirements: ["Medical ID", "CPR Certification"]
  },
  {
    id: 2,
    title: "Food Distribution Team",
    organization: "DSWD Relief Operations",
    organizationId: "org_dswd_relief",
    description: "Help distribute food packs and manage supply logistics at Rizal Park evacuation area. Physical fitness required for lifting and moving supplies.",
    location: "Rizal Park, Manila",
    coordinates: { lat: 14.5832, lng: 120.9790 },
    skillsRequired: ["Logistics", "Team Management", "Physical Fitness"],
    volunteersNeeded: 5,
    volunteersAssigned: 2,
    urgency: "Medium",
    datePosted: "2024-01-11",
    contactPerson: "Mr. Juan Dela Cruz",
    contactPhone: "+63 917 123 4567",
    contactEmail: "jdelacruz@dswd.gov.ph",
    status: "Open",
    estimatedDuration: "6 hours",
    requirements: ["Comfortable Shoes", "Water Bottle"]
  },
  {
    id: 3,
    title: "Emergency Shelter Setup",
    organization: "Local Government Unit - Marikina",
    organizationId: "org_lgu_marikina",
    description: "Assist in setting up temporary shelters and emergency facilities for displaced families. Construction experience helpful but not required.",
    location: "Marikina Sports Center",
    coordinates: { lat: 14.6415, lng: 121.1007 },
    skillsRequired: ["Construction", "Logistics", "Teamwork"],
    volunteersNeeded: 8,
    volunteersAssigned: 4,
    urgency: "High",
    datePosted: "2024-01-12",
    contactPerson: "Engr. Roberto Lim",
    contactPhone: "+63 918 765 4321",
    contactEmail: "rlim@marikina.gov.ph",
    status: "Open",
    estimatedDuration: "4 hours",
    requirements: ["Work Gloves", "Comfortable Clothes"]
  },
  {
    id: 4,
    title: "Psychological First Aid",
    organization: "Mental Health Philippines",
    organizationId: "org_mh_ph",
    description: "Provide emotional support and psychological first aid to trauma-affected individuals and families.",
    location: "Various Evacuation Centers",
    coordinates: { lat: 14.6091, lng: 121.0223 },
    skillsRequired: ["Counseling", "Psychology", "Active Listening"],
    volunteersNeeded: 4,
    volunteersAssigned: 1,
    urgency: "Medium",
    datePosted: "2024-01-09",
    contactPerson: "Dr. Sofia Reyes",
    contactPhone: "+63 916 555 1234",
    contactEmail: "sreyes@mentalhealthph.org",
    status: "Open",
    estimatedDuration: "6 hours",
    requirements: ["Psychology Background", "Training Certificate"]
  },
  {
    id: 5,
    title: "Communication and Information",
    organization: "NDRRMC Operations",
    organizationId: "org_ndrrmc",
    description: "Manage information desk and coordinate communications between different response teams.",
    location: "Central Command Center, Camp Aguinaldo",
    coordinates: { lat: 14.6091, lng: 121.0223 },
    skillsRequired: ["Communication", "Organization", "Multitasking"],
    volunteersNeeded: 2,
    volunteersAssigned: 1,
    urgency: "Low",
    datePosted: "2024-01-13",
    contactPerson: "Capt. Anna Torres",
    contactPhone: "+63 915 444 5678",
    contactEmail: "atorres@ndrrmc.gov.ph",
    status: "Open",
    estimatedDuration: "8 hours",
    requirements: ["Good Communication Skills"]
  },
  {
    id: 6,
    title: "Search and Rescue Support",
    organization: "Coast Guard SAR Team",
    organizationId: "org_coastguard_sar",
    description: "Assist in search and rescue operations in flood-affected areas. Water safety training required.",
    location: "Marikina River Basin",
    coordinates: { lat: 14.6333, lng: 121.1000 },
    skillsRequired: ["Water Rescue", "First Aid", "Navigation"],
    volunteersNeeded: 6,
    volunteersAssigned: 3,
    urgency: "High",
    datePosted: "2024-01-14",
    contactPerson: "Lt. Michael Cruz",
    contactPhone: "+63 919 888 9999",
    contactEmail: "mcruz@coastguard.gov.ph",
    status: "Open",
    estimatedDuration: "12 hours",
    requirements: ["Water Safety Training", "Physical Fitness"]
  }
];

// Response Popup Component
function ResponsePopup({ isOpen, onClose, onSubmit, need }: ResponsePopupProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: "",
    contact: "",
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
          </div>

          {/* Response Form */}
          <div className="space-y-3">
            <div>
              <label className="text-white text-sm font-medium mb-1 block">Full Name</label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1 block">Contact Information</label>
              <Input
                value={formData.contact}
                onChange={(e) => handleChange('contact', e.target.value)}
                placeholder="Phone number or email"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1 block">Availability</label>
              <select
                value={formData.availability}
                onChange={(e) => handleChange('availability', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                required
              >
                <option value="" className="bg-gray-800">Select availability</option>
                <option value="immediate" className="bg-gray-800">Immediate</option>
                <option value="today" className="bg-gray-800">Today</option>
                <option value="this_week" className="bg-gray-800">This Week</option>
                <option value="next_week" className="bg-gray-800">Next Week</option>
              </select>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1 block">Relevant Skills</label>
              <Input
                value={formData.skills}
                onChange={(e) => handleChange('skills', e.target.value)}
                placeholder="e.g., First Aid, Logistics, Cooking"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-1 block">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any additional information or questions..."
                rows={3}
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

interface StatsMetric {
  title: string;
  value: string;
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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);

  const filteredNeeds = extendedMockNeeds.filter((n) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.organization.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.skillsRequired.some(skill => skill.toLowerCase().includes(q));
    const matchesFilter = filter === "all" || n.urgency.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Mock metrics for stats cards
  const statsMetrics: StatsMetric[] = [
    {
      title: "Total Open Needs",
      value: extendedMockNeeds.length.toString(),
    },
    {
      title: "High Priority",
      value: extendedMockNeeds.filter((n) => n.urgency === "High").length.toString(),
    },
    {
      title: "Volunteers Needed",
      value: extendedMockNeeds.reduce((sum, need) => sum + (need.volunteersNeeded - need.volunteersAssigned), 0).toString(),
    },
  ];

  const handleRespondClick = (need: Need) => {
    setSelectedNeed(need);
    setIsResponseOpen(true);
  };

  const handleCloseResponse = () => {
    setIsResponseOpen(false);
    setSelectedNeed(null);
  };

  const handleSubmitResponse = (responseData: ApplicationFormData) => {
    // This would create an application in Firebase
    const applicationData = {
      needId: selectedNeed!.id,
      organizationId: selectedNeed!.organizationId,
      volunteerId: "current_volunteer_id", // From auth
      volunteerName: responseData.name,
      volunteerContact: responseData.contact,
      appliedDate: new Date().toISOString(),
      status: "Pending",
      availability: responseData.availability,
      skills: responseData.skills.split(',').map(s => s.trim()),
      notes: responseData.notes,
      needTitle: selectedNeed!.title,
      organizationName: selectedNeed!.organization
    };

    console.log('Application submitted:', applicationData);
    // Here you would typically send the application to your backend
    alert(`Application submitted to ${selectedNeed!.organization}! They will contact you soon.`);
    handleCloseResponse();
  };

  const handleContactOrganization = (need: Need) => {
    console.log("Contacting organization:", need.organization);
    // This could open email client or phone dialer
    alert(`Contact ${need.contactPerson} at ${need.contactPhone} or ${need.contactEmail}`);
  };

  return (
    // REMOVED overflow-hidden from main container - this was causing the issue
    <div className="px-2 md:px-4 space-y-4 pb-6 min-h-screen">
      {/* Header with Search */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-lg font-semibold text-white">Available Volunteer Opportunities</h1>
          <p className="text-sm text-gray-400">Find and apply to help with current needs</p>
        </div>
        <div className="flex items-center space-x-3">
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
              className="appearance-none bg-gray-900 border border-gray-700 rounded-lg px-3 py-[5px] text-sm text-white focus:outline-none focus:border-blue-500 w-40 pr-8"
            >
              <option value="all" className="bg-gray-800 text-white">All Urgency</option>
              <option value="high" className="bg-gray-800 text-white">High Priority</option>
              <option value="medium" className="bg-gray-800 text-white">Medium</option>
              <option value="low" className="bg-gray-800 text-white">Low</option>
            </select>
            <ChevronDown size={14} className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Bell Button */}
          <Button variant="ghost" size="sm" className="h-8 hover:bg-gray-600">
            <Bell size={16} className="text-white" />
          </Button>
        </div>
      </div>

      {/* Stats Row - Centered and Compact */}
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-4 max-w-2xl">
          {statsMetrics.map((metric, index) => (
            <Card key={index} className="border-0 w-40" style={cardGradientStyle}>
              <CardHeader className="flex flex-col items-center space-y-0 pb-2 border-b-0">
                <CardTitle className="text-sm font-medium text-white text-center leading-tight">
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-white">
                  {metric.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Needs List - Grid layout with square cards */}
      <Card className="border-0 flex-1 min-h-0 flex flex-col" style={cardGradientStyle}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b-0">
          <CardTitle className="text-sm font-medium text-white">
            Available Volunteer Opportunities
          </CardTitle>
          <div className="text-xs text-neutral-400">
            {filteredNeeds.length} {filteredNeeds.length === 1 ? 'opportunity' : 'opportunities'} found
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNeeds.map((need) => (
                <Card 
                  key={need.id} 
                  className="border border-neutral-700 bg-neutral-800/20 hover:bg-neutral-800/40 transition-all duration-200 flex flex-col min-h-96"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-sm font-medium text-white flex-1">
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
                          {need.volunteersAssigned}/{need.volunteersNeeded} volunteers • {need.estimatedDuration}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Clock size={12} />
                        <span>Posted: {need.datePosted}</span>
                      </div>
                    </div>

                    {/* Skills Required */}
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

                    {/* Contact Info */}
                    <div className="mb-3 p-2 bg-gray-800/30 rounded">
                      <p className="text-xs text-neutral-400 mb-1">Contact:</p>
                      <p className="text-white text-xs">{need.contactPerson}</p>
                      <div className="flex items-center gap-1 text-xs text-neutral-400">
                        <Phone size={10} />
                        <span>{need.contactPhone}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        onClick={() => handleRespondClick(need)}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs h-8"
                      >
                        Apply to Help
                      </Button>
                      <Button 
                        onClick={() => handleContactOrganization(need)}
                        variant="outline"
                        className="text-xs h-8 border-gray-600 hover:bg-gray-700"
                        title="Contact Organization"
                      >
                        <Phone size={12} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredNeeds.length === 0 && (
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
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Popup */}
      <ResponsePopup
        isOpen={isResponseOpen}
        onClose={handleCloseResponse}
        onSubmit={handleSubmitResponse}
        need={selectedNeed}
      />
    </div>
  );
}