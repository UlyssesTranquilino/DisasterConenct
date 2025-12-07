import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { ChevronDown } from "lucide-react"
import { useAuth } from "../../lib/auth"
import { useSimpleToast } from "../../components/components/ui/SimpleToast"

// Gradient background style for cards (same as dashboard)
const cardGradientStyle = {
  background: "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

export default function VolunteerRegisterPage() {
  const { currentUser } = useAuth()
  const [formData, setFormData] = useState({
    phone: "",
    role: "medical",
    experience: "",
    location: "",
    skills: [] as string[],
    availability: {
      days: [] as string[],
      hours: "",
    },
    emergencyContact: "",
    certifications: "",
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentSkill, setCurrentSkill] = useState("")
  
  // Initialize toast
  const { success, error: toastError, ToastContainer } = useSimpleToast()

  // Scrollbar fix - disable scrolling when component mounts
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSkillAdd = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, currentSkill.trim()]
      })
      setCurrentSkill("")
    }
  }

  const handleSkillRemove = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    })
  }

  const handleAvailabilityChange = (day: string) => {
    if (formData.availability.days.includes(day)) {
      setFormData({
        ...formData,
        availability: {
          ...formData.availability,
          days: formData.availability.days.filter(d => d !== day)
        }
      })
    } else {
      setFormData({
        ...formData,
        availability: {
          ...formData.availability,
          days: [...formData.availability.days, day]
        }
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.phone.trim()) {
      toastError('Missing Information', 'Phone number is required');
      return;
    }
    
    setLoading(true);

    try {
      // Prepare volunteer profile data
      const volunteerProfileData = {
        phone: formData.phone,
        role: formData.role,
        experience: formData.experience ? parseInt(formData.experience) : 0,
        preferredLocation: formData.location,
        skills: formData.skills,
        availability: formData.availability,
        emergencyContact: formData.emergencyContact,
        certifications: formData.certifications ? formData.certifications.split(',').map(c => c.trim()) : [],
      };

      console.log("Volunteer Profile Update Submitted:", volunteerProfileData);

      // Simulate API call
      setTimeout(() => {
        success(
          'Profile Complete!',
          '✅ Your volunteer profile has been updated successfully.\n\nYou can now browse and apply for volunteer opportunities.'
        );
        setSubmitted(true);
        setLoading(false);
      }, 1000);

    } catch (error: any) {
      console.error("Profile update failed:", error);
      toastError('Profile Update Failed', error.message || 'Failed to update volunteer profile. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="px-4 md:px-6 space-y-6 pb-8 min-h-screen flex flex-col">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-xl font-semibold text-white">Complete Your Volunteer Profile</h1>
        <p className="text-gray-400 mt-1">
          Add volunteer-specific information to help us match you with the right opportunities
        </p>
      </div>

      {/* Centered Registration Form */}
      <div className="flex-1 flex items-center justify-center py-4">
        <Card className="border-0 w-full max-w-4xl" style={cardGradientStyle}>
          <CardHeader className="flex flex-col items-center space-y-0 pb-4 border-b-0 px-6 pt-6">
            <CardTitle className="text-2xl font-bold text-white text-center mb-2">
              Volunteer Profile Information
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {!currentUser ? (
              <div className="text-center py-8">
                <p className="text-white text-lg mb-4">Please log in to complete your volunteer profile.</p>
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Go to Login
                </Button>
              </div>
            ) : !submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone - Required field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Phone Number *</label>
                    <Input
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500">Required for emergency contact</p>
                  </div>

                  {/* Role / Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Field of Volunteering *</label>
                    <div className="relative">
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="appearance-none bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 w-full"
                        required
                        disabled={loading}
                      >
                        <option value="medical">Medical Support</option>
                        <option value="food">Food & Supply Distribution</option>
                        <option value="logistics">Logistics & Transport</option>
                        <option value="communication">Communication / Information</option>
                        <option value="rescue">Rescue Operations</option>
                        <option value="construction">Construction & Repair</option>
                        <option value="counseling">Counseling & Support</option>
                        <option value="administration">Administration</option>
                        <option value="technical">Technical Support</option>
                        <option value="translation">Translation Services</option>
                      </select>
                      <ChevronDown size={16} className="text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Years of Experience</label>
                    <Input
                      type="number"
                      name="experience"
                      placeholder="0"
                      value={formData.experience}
                      onChange={handleChange}
                      className="bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                      disabled={loading}
                      min="0"
                      max="50"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Preferred Location</label>
                    <Input
                      name="location"
                      placeholder="Enter your preferred city or province"
                      value={formData.location}
                      onChange={handleChange}
                      className="bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                      disabled={loading}
                    />
                  </div>

                  {/* Emergency Contact */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Emergency Contact</label>
                    <Input
                      name="emergencyContact"
                      placeholder="Name and phone number"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      className="bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500">Optional - for emergency situations only</p>
                  </div>

                  {/* Certifications */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Certifications</label>
                    <Input
                      name="certifications"
                      placeholder="e.g., First Aid, CPR, EMT (comma separated)"
                      value={formData.certifications}
                      onChange={handleChange}
                      className="bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">Skills</label>
                  <div className="flex gap-2">
                    <Input
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      placeholder="Add a skill (e.g., First Aid, Spanish, Driving)"
                      className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd())}
                      disabled={loading}
                    />
                    <Button 
                      type="button" 
                      onClick={handleSkillAdd} 
                      className="bg-green-600 hover:bg-green-500" 
                      disabled={loading}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleSkillRemove(skill)}
                          className="text-blue-300 hover:text-white text-xs"
                          disabled={loading}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white">Availability</label>
                  <div className="flex flex-wrap gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleAvailabilityChange(day)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                          formData.availability.days.includes(day)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                        disabled={loading}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <Input
                    name="availability.hours"
                    placeholder="Preferred hours (e.g., Weekends only, Evenings, Flexible, 9am-5pm)"
                    value={formData.availability.hours}
                    onChange={(e) => setFormData({
                      ...formData,
                      availability: { ...formData.availability, hours: e.target.value }
                    })}
                    className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 mt-2"
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 text-base font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Saving Profile..." : "Save Volunteer Profile"}
                </Button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-6">
                <div className="text-green-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-400 mb-4">
                  Profile Complete!
                </h2>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Your volunteer profile has been updated. You can now browse and apply for volunteer opportunities.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => window.location.href = '/volunteer/dashboard'}
                    className="bg-blue-600 hover:bg-blue-500 text-white w-full"
                  >
                    Go to Volunteer Dashboard
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/volunteer/needs'}
                    className="bg-green-600 hover:bg-green-500 text-white w-full"
                  >
                    Browse Volunteer Opportunities
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}