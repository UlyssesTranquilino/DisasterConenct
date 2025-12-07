import { useState } from "react";
import { mockNeeds } from "../../mock/data";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Search, Bell, ChevronDown, MapPin, Users, Clock, X } from "lucide-react";

// Gradient background style for cards (same as dashboard)
const cardGradientStyle = {
  background: "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

// Define proper TypeScript interfaces
interface Need {
  id: number;
  type: string;
  description: string;
  location: string;
  priority: "High" | "Medium" | "Low";
  volunteersNeeded: number;
  urgency: string;
}

interface FormData {
  name: string;
  contact: string;
  availability: string;
  skills: string;
  notes: string;
}

interface ResponsePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  need: Need | null;
}

// Complete mock data - don't rely on imported mockNeeds
const extendedMockNeeds: Need[] = [
  {
    id: 1,
    type: "medical",
    description: "Urgent medical assistance required at evacuation center",
    location: "Quezon City Memorial Center",
    priority: "High",
    volunteersNeeded: 5,
    urgency: "Immediate"
  },
  {
    id: 2,
    type: "food",
    description: "Food distribution and meal preparation for 200 people",
    location: "Rizal Park Evacuation",
    priority: "Medium",
    volunteersNeeded: 8,
    urgency: "Today"
  },
  {
    id: 3,
    type: "logistics",
    description: "Coordination of supply deliveries to affected areas",
    location: "Manila Operations Center",
    priority: "High",
    volunteersNeeded: 3,
    urgency: "Immediate"
  },
  {
    id: 4,
    type: "medical",
    description: "Emergency first aid supplies for evacuation center",
    location: "Manila General Hospital",
    priority: "High",
    volunteersNeeded: 3,
    urgency: "Immediate"
  },
  {
    id: 5,
    type: "food",
    description: "Hot meal distribution in affected areas",
    location: "Quezon City Memorial",
    priority: "Medium",
    volunteersNeeded: 5,
    urgency: "Today"
  },
  {
    id: 6,
    type: "logistics",
    description: "Supply chain coordination and distribution",
    location: "Central Command Center",
    priority: "High",
    volunteersNeeded: 4,
    urgency: "Immediate"
  },
  {
    id: 7,
    type: "medical",
    description: "Mental health support for displaced families",
    location: "San Juan Evacuation",
    priority: "Medium",
    volunteersNeeded: 2,
    urgency: "This Week"
  },
  {
    id: 8,
    type: "food",
    description: "Water purification and distribution",
    location: "Marikina River Area",
    priority: "High",
    volunteersNeeded: 6,
    urgency: "Immediate"
  },
  {
    id: 9,
    type: "logistics",
    description: "Transport coordination for relief goods",
    location: "Pasig Central",
    priority: "Medium",
    volunteersNeeded: 3,
    urgency: "Today"
  },
  {
    id: 10,
    type: "medical",
    description: "Mobile clinic setup in remote areas",
    location: "Rizal Province",
    priority: "High",
    volunteersNeeded: 4,
    urgency: "Immediate"
  },
  {
    id: 11,
    type: "food",
    description: "Food packaging for emergency kits",
    location: "Makati Relief Center",
    priority: "Low",
    volunteersNeeded: 8,
    urgency: "This Week"
  },
  {
    id: 12,
    type: "logistics",
    description: "Warehouse organization and inventory",
    location: "Taguig Storage Facility",
    priority: "Medium",
    volunteersNeeded: 5,
    urgency: "Today"
  }
];

// Response Popup Component
function ResponsePopup({ isOpen, onClose, onSubmit, need }: ResponsePopupProps) {
  const [formData, setFormData] = useState<FormData>({
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

  const handleChange = (field: keyof FormData, value: string) => {
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
          <h3 className="text-lg font-semibold text-white">Respond to Need</h3>
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
            <h4 className="text-white font-medium text-sm mb-2">Need Details:</h4>
            <p className="text-gray-300 text-sm capitalize">{need.type} - {need.description}</p>
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
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
            >
              Submit Response
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

export default function VolunteerNeedsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState<Need | null>(null);

  const filteredNeeds = extendedMockNeeds.filter((n) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      n.type.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.location.toLowerCase().includes(q);
    const matchesFilter = filter === "all" || n.type.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Mock metrics for stats cards
  const statsMetrics: StatsMetric[] = [
    {
      title: "Total Active Needs",
      value: extendedMockNeeds.length.toString(),
    },
    {
      title: "Urgent Requests",
      value: extendedMockNeeds.filter((n) => n.priority === "High").length.toString(),
    },
    {
      title: "Fulfilled This Week",
      value: "8",
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

  const handleSubmitResponse = (responseData: FormData) => {
    console.log('Response submitted:', {
      need: selectedNeed,
      response: responseData
    });
    // Here you would typically send the response to your backend
    alert('Response submitted successfully!');
    handleCloseResponse();
  };

  return (
    // REMOVED overflow-hidden from main container - this was causing the issue
    <div className="px-2 md:px-4 space-y-4 pb-6 min-h-screen">
      {/* Header with Search */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-lg font-semibold text-white">Active Volunteer Needs</h1>
        </div>
        <div className="flex items-center space-x-3">
          {/* Search Bar */}
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-2 py-[5px]">
            <Search size={14} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search needs..."
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
              <option value="all" className="bg-gray-800 text-white">All Needs</option>
              <option value="medical" className="bg-gray-800 text-white">Medical</option>
              <option value="food" className="bg-gray-800 text-white">Food</option>
              <option value="logistics" className="bg-gray-800 text-white">Logistics</option>
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
            Active Volunteer Needs
          </CardTitle>
          <div className="text-xs text-neutral-400">
            {filteredNeeds.length} {filteredNeeds.length === 1 ? 'need' : 'needs'} found
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredNeeds.map((n) => (
                <Card 
                  key={n.id} 
                  className="border border-neutral-700 bg-neutral-800/20 hover:bg-neutral-800/40 transition-all duration-200 flex flex-col h-64"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="capitalize text-sm font-medium text-white">
                        {n.type}
                      </CardTitle>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                          n.priority === "High"
                            ? "bg-red-500/20 text-red-400"
                            : n.priority === "Medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {n.priority}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 flex-1 flex flex-col">
                    <div className="text-sm text-neutral-300 mb-3 line-clamp-3 flex-1">
                      {n.description}
                    </div>
                    
                    {/* Additional Info */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <MapPin size={12} />
                        <span className="truncate">{n.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Users size={12} />
                        <span>{n.volunteersNeeded} volunteers needed</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Clock size={12} />
                        <span>Urgency: {n.urgency}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleRespondClick(n)}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-7 w-full mt-auto"
                    >
                      Respond to Need
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {filteredNeeds.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-center py-12">
                  <div className="text-neutral-600 mb-3">
                    <Search size={32} />
                  </div>
                  <p className="text-sm text-neutral-400 font-medium mb-1">
                    No active needs found
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