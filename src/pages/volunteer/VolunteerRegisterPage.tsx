import { useState } from "react"
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Volunteer Registration Submitted:", formData)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1121] to-[#111c2d] text-white p-6 flex justify-center items-center">
      <Card className="w-full max-w-lg bg-[#1a253a] border border-slate-700 shadow-lg shadow-blue-900/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-blue-400">
            Volunteer Registration
          </CardTitle>
        </CardHeader>

        <CardContent>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-slate-300 mb-1">Full Name</label>
                <Input
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-[#111b2d] text-white border-slate-600"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-slate-300 mb-1">Email Address</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-[#111b2d] text-white border-slate-600"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-slate-300 mb-1">Phone Number</label>
                <Input
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-[#111b2d] text-white border-slate-600"
                  required
                />
              </div>

              {/* Role / Field */}
              <div>
                <label className="block text-sm text-slate-300 mb-1">Field of Volunteering</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="bg-[#111b2d] text-white border border-slate-600 w-full p-2 rounded-md"
                >
                  <option value="medical">Medical Support</option>
                  <option value="food">Food & Supply Distribution</option>
                  <option value="logistics">Logistics & Transport</option>
                  <option value="communication">Communication / Information</option>
                  <option value="rescue">Rescue Operations</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm text-slate-300 mb-1">Years of Experience</label>
                <Input
                  type="number"
                  name="experience"
                  placeholder="0"
                  value={formData.experience}
                  onChange={handleChange}
                  className="bg-[#111b2d] text-white border-slate-600"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm text-slate-300 mb-1">Preferred Location</label>
                <Input
                  name="location"
                  placeholder="Enter your preferred city or province"
                  value={formData.location}
                  onChange={handleChange}
                  className="bg-[#111b2d] text-white border-slate-600"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white mt-4 font-semibold"
              >
                Register as Volunteer
              </Button>
            </form>
          ) : (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-green-400 mb-2">
                Registration Successful!
              </h2>
              <p className="text-slate-300">
                Thank you for registering as a volunteer. We’ll contact you soon with deployment
                details.
              </p>

              <Button
                onClick={() => setSubmitted(false)}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white"
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
