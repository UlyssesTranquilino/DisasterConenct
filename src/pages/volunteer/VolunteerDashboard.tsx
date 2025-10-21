import { useState } from "react";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import VolunteerMap from "../../components/VolunteerMap";

interface MapLocation {
  id: number;
  name: string;
  position: [number, number];
  capacity: number;
  supplies: string[];
  contact: string;
  occupancy: number;
}

export default function VolunteerDashboard() {
  const [volunteers] = useState([
    {
      name: "Esthera Jackson",
      email: "esthera@simmimple.com",
      role: "Manager, Organization",
      status: "Online",
      date: "14/06/21",
    },
    // ... rest of your volunteer data
  ]);

  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* --- Header Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-transparent border border-white/10">
            <CardHeader>
              <CardTitle>Total Volunteers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">120</p>
              <span className="text-emerald-400 text-sm">+5%</span>
            </CardContent>
          </Card>

          <Card className="bg-transparent border border-white/10">
            <CardHeader>
              <CardTitle>Active Volunteers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">2,300</p>
              <span className="text-emerald-400 text-sm">+0.5%</span>
            </CardContent>
          </Card>

          <Card className="bg-transparent border border-white/10">
            <CardHeader>
              <CardTitle>Available Volunteers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">2,300</p>
              <span className="text-emerald-400 text-sm">+5%</span>
            </CardContent>
          </Card>
        </div>

        {/* --- Volunteer List --- */}
        <div className="rounded-2xl overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold">Volunteer List</h2>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm">
              Add Evacuation Center
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left border-b border-white/10">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Employed</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((v) => (
                  <tr key={v.email} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 font-medium">{v.name}</td>
                    <td className="p-3 text-gray-300">{v.email}</td>
                    <td className="p-3 text-gray-300">{v.role}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          v.status === "Online"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-gray-600/30 text-gray-400"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">{v.date}</td>
                    <td className="p-3 text-indigo-400 hover:text-indigo-300 cursor-pointer">
                      Edit
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- Map & Center Detail --- */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 h-96">
            <VolunteerMap onLocationSelect={handleLocationSelect} />
          </div>

          {/* Detail Section */}
          <div className="rounded-2xl border border-white/10 p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              {selectedLocation ? selectedLocation.name : "Evacuation Center Detail"}
            </h2>
            
            {selectedLocation ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Capacity</span>
                  <span className="text-gray-200">{selectedLocation.capacity} people</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Current Occupancy</span>
                  <span className="text-emerald-400 font-semibold">{selectedLocation.occupancy}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Contact</span>
                  <span className="text-gray-200">{selectedLocation.contact}</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-gray-300 mb-2">Available Supplies:</p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {selectedLocation.supplies.map((supply, index) => (
                      <li key={index}>• {supply}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Click on a map marker to view center details
                <br />• Shows capacity, available supplies, contact, and occupancy
              </p>
            )}

            {/* Additional stats that show regardless of selection */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">System Status</span>
                <span className="text-emerald-400 font-semibold">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Active Centers</span>
                <span className="text-gray-200">3/5</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}