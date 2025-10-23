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
    <div className="w-full p-6 flex justify-center items-center h-screen overflow-hidden"> 
      <Card className="w-full max-w-6xl bg-transparent border border-white/10 shadow-md py-6 px-8 mx-auto"> 
        <CardHeader className="pb-4">
          <CardTitle className="text-5xl/normal font-bold text-center text-white">
            Volunteer Registration
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-4xl">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-white">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-base font-medium">Full Name</label>
                <Input
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border-white/10 bg-transparent h-11 text-base text-white placeholder:text-gray-400 rounded-lg"
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
                  className="border-white/10 bg-transparent h-11 text-base text-white placeholder:text-gray-400 rounded-lg"
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
                  className="border-white/10 bg-transparent h-11 text-base text-white placeholder:text-gray-400 rounded-lg"
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
                  className="flex h-11 w-full rounded-lg border border-white/10 bg-transparent text-white px-3 py-2 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="medical" className="bg-gray-800 text-white">Medical Support</option>
                  <option value="food" className="bg-gray-800 text-white">Food & Supply Distribution</option>
                  <option value="logistics" className="bg-gray-800 text-white">Logistics & Transport</option>
                  <option value="communication" className="bg-gray-800 text-white">Communication / Information</option>
                  <option value="rescue" className="bg-gray-800 text-white">Rescue Operations</option>
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
                  className="border-white/10 bg-transparent h-11 text-base text-white placeholder:text-gray-400 rounded-lg"
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
                  className="border-white/10 bg-transparent h-11 text-base text-white placeholder:text-gray-400 rounded-lg"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white mt-4 py-3 text-base font-semibold h-12 rounded-lg"
              >
                Register as Volunteer
              </Button>
            </form>
          ) : (
            <div className="text-center py-8 text-white space-y-4">
              <h2 className="text-xl font-semibold text-green-400 mb-3">
                Registration Successful!
              </h2>
              <p className="text-base text-gray-300">
                Thank you for registering as a volunteer. We'll contact you soon with deployment
                details.
              </p>

              <Button
                onClick={() => setSubmitted(false)}
                className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-6 text-base h-11 rounded-lg"
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