import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Search, Bell, ChevronDown } from "lucide-react"

// Gradient background style for cards (same as dashboard)
const cardGradientStyle = {
  background: "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

export default function VolunteerRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "medical",
    experience: "",
    location: "",
  })

  const [submitted, setSubmitted] = useState(false)

  // Scrollbar fix - disable scrolling when component mounts
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Volunteer Registration Submitted:", formData)
    setSubmitted(true)
  }

  return (
    <div className="px-4 md:px-6 space-y-6 pb-8 min-h-screen flex flex-col">
      {/* Header with Search - Same as dashboard */}
      <div className="flex justify-between items-center pt-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Volunteer Registration</h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-base text-white placeholder-gray-400 focus:outline-none w-40 md:w-64"
            />
          </div>

          {/* Bell Button */}
          <Button variant="ghost" size="sm" className="h-10 hover:bg-gray-600">
            <Bell size={18} className="text-white" />
          </Button>
        </div>
      </div>

      {/* Centered Registration Form */}
      <div className="flex-1 flex items-center justify-center py-8">
        <Card className="border-0 w-full max-w-6xl" style={cardGradientStyle}>
          <CardHeader className="flex flex-col items-center space-y-0 pb-6 border-b-0 px-6 pt-8">
            <CardTitle className="text-[2.5rem] font-bold text-white text-center mb-4">
              Volunteer Registration
            </CardTitle>
            <p className="text-neutral-400 text-lg text-center leading-relaxed">
              Join our volunteer network and make a meaningful impact in disaster response efforts across the region
            </p>
          </CardHeader>

          <CardContent className="p-6">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-3">
                    <label className="block text-lg font-medium text-white">Full Name</label>
                    <Input
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 h-14 text-lg px-4"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-3">
                    <label className="block text-lg font-medium text-white">Email Address</label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 h-14 text-lg px-4"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-3">
                    <label className="block text-lg font-medium text-white">Phone Number</label>
                    <Input
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 h-14 text-lg px-4"
                      required
                    />
                  </div>

                  {/* Role / Field */}
                  <div className="space-y-3">
                    <label className="block text-lg font-medium text-white">Field of Volunteering</label>
                    <div className="relative">
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="appearance-none bg-gray-900 border border-gray-700 rounded-lg px-4 py-4 text-lg text-white focus:outline-none focus:border-blue-500 w-full pr-12 h-14"
                      >
                        <option value="medical" className="bg-gray-800 text-white text-lg">Medical Support</option>
                        <option value="food" className="bg-gray-800 text-white text-lg">Food & Supply Distribution</option>
                        <option value="logistics" className="bg-gray-800 text-white text-lg">Logistics & Transport</option>
                        <option value="communication" className="bg-gray-800 text-white text-lg">Communication / Information</option>
                        <option value="rescue" className="bg-gray-800 text-white text-lg">Rescue Operations</option>
                      </select>
                      <ChevronDown size={20} className="text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-3">
                    <label className="block text-lg font-medium text-white">Years of Experience</label>
                    <Input
                      type="number"
                      name="experience"
                      placeholder="0"
                      value={formData.experience}
                      onChange={handleChange}
                      className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 h-14 text-lg px-4"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-3">
                    <label className="block text-lg font-medium text-white">Preferred Location</label>
                    <Input
                      name="location"
                      placeholder="Enter your preferred city or province"
                      value={formData.location}
                      onChange={handleChange}
                      className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 h-14 text-lg px-4"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white mt-6 py-5 text-xl font-semibold h-16 rounded-lg"
                >
                  Register as Volunteer
                </Button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-6">
                <div className="text-green-400 mb-4">
                  <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-[2.5rem] font-bold text-green-400 mb-4">
                  Registration Successful!
                </h2>
                <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                  Thank you for registering as a volunteer. Our team will contact you within 24-48 hours 
                  with deployment details, training information, and next steps to get you started.
                </p>

                <Button
                  onClick={() => setSubmitted(false)}
                  className="bg-blue-600 hover:bg-blue-500 text-white py-5 px-12 text-xl h-16 rounded-lg"
                >
                  Register Another Volunteer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}