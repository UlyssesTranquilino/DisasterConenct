import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import apiService from "../../lib/api"
import { useNavigate } from "react-router-dom"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// Gradient background style for cards
const cardGradientStyle = {
  background: "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};


export default function CitizenDashboard() {
  const { currentUser, isLoading, refreshUser } = useAuth()
  const navigate = useNavigate()

  const handleBecomeVolunteer = async () => {
  try {
    const response = await apiService.updateUserRole("volunteer");

    if (response.success) {
      // Refresh user in context
      await refreshUser();

      // Navigate to volunteer dashboard
      navigate("/volunteer/dashboard");
    }
  } catch (err) {
    console.error("Failed to update role:", err);
  }
};

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>
  }

  const user = currentUser ?? { name: "Guest User" }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Citizen Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user.name}! This is your disaster management portal.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">

        {/* Current Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              No active requests. Stay safe and monitor announcements.
            </div>

            {/* Become Volunteer Button */}
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={handleBecomeVolunteer}
            >
              Become a Volunteer
            </Button>
          </CardContent>
        </Card>

        {/* Request Help card */}
        <Card>
          <CardHeader>
            <CardTitle>Need Assistance?</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
          <Link to="/citizen/request-help">
            <Button className='w-full bg-blue-900 hover:bg-blue-950 text-white'>
              <AlertTriangle size={16} className="mr-2" /> 
              Request Help
            </Button>
          </Link>
          </CardContent>
        </Card>

      </div>



      <Card className="border-0 h-[450px] flex flex-col" style={cardGradientStyle}>
      <CardHeader className="border-b-0 p-0">
        <CardTitle className="text-white text-sm font-medium p-2">
          Disaster Map
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-full">
        <MapContainer
        center={[14.5995, 120.9842]}
        zoom={11}
        className="h-full w-full"
        > 
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          />
        </MapContainer>
      </CardContent>
    </Card>
    </div>

    
  )
}
