import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"

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
    // Store the original overflow value
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // Disable scrolling on mount
    document.body.style.overflow = 'hidden';
    
    // Re-enable scrolling when component unmounts
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
    <div className="w-full p-6 flex justify-center items-center h-screen overflow-hidden"> 
      <Card className="w-full max-w-6xl bg-white border border-slate-300 shadow-md py-6 px-8 mx-auto"> 
        <CardHeader className="pb-4">
          <CardTitle className="text-5xl font-bold text-center text-blue-700">
            Volunteer Registration
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-4xl">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-blue-700">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-base font-medium">Full Name</label>
                <Input
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border-slate-300 h-11 text-base"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-base font-medium">Email Address</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="border-slate-300 h-11 text-base"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-base font-medium">Phone Number</label>
                <Input
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border-slate-300 h-11 text-base"
                  required
                />
              </div>

              {/* Role / Field */}
              <div className="space-y-2">
                <label className="block text-base font-medium">Field of Volunteering</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="border border-slate-300 w-full p-3 rounded-md text-base h-11"
                >
                  <option value="medical">Medical Support</option>
                  <option value="food">Food & Supply Distribution</option>
                  <option value="logistics">Logistics & Transport</option>
                  <option value="communication">Communication / Information</option>
                  <option value="rescue">Rescue Operations</option>
                </select>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <label className="block text-base font-medium">Years of Experience</label>
                <Input
                  type="number"
                  name="experience"
                  placeholder="0"
                  value={formData.experience}
                  onChange={handleChange}
                  className="border-slate-300 h-11 text-base"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-base font-medium">Preferred Location</label>
                <Input
                  name="location"
                  placeholder="Enter your preferred city or province"
                  value={formData.location}
                  onChange={handleChange}
                  className="border-slate-300 h-11 text-base"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white mt-4 py-3 text-base font-semibold h-12"
              >
                Register as Volunteer
              </Button>
            </form>
          ) : (
            <div className="text-center py-8 text-slate-800 space-y-4">
              <h2 className="text-xl font-semibold text-green-600 mb-3">
                Registration Successful!
              </h2>
              <p className="text-base">
                Thank you for registering as a volunteer. We'll contact you soon with deployment
                details.
              </p>

              <Button
                onClick={() => setSubmitted(false)}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 text-base h-11"
              >
                Register Another
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}