import { useState } from "react";
import { MapPin } from "lucide-react";

export default function VolunteerDashboard() {
  const [volunteers] = useState([
    {
      name: "Esthera Jackson",
      email: "esthera@simmimple.com",
      role: "Manager, Organization",
      status: "Online",
      date: "14/06/21",
    },
    {
      name: "Alexa Liras",
      email: "alexa@simmimple.com",
      role: "Programmer, Developer",
      status: "Offline",
      date: "14/06/21",
    },
    {
      name: "Laurent Michael",
      email: "laurent@simmimple.com",
      role: "Executive, Projects",
      status: "Online",
      date: "14/06/21",
    },
    {
      name: "Freduardo Hill",
      email: "freduardo@simmimple.com",
      role: "Manager, Organization",
      status: "Online",
      date: "14/06/21",
    },
    {
      name: "Daniel Thomas",
      email: "daniel@simmimple.com",
      role: "Programmer, Developer",
      status: "Offline",
      date: "14/06/21",
    },
    {
      name: "Mark Wilson",
      email: "mark@simmimple.com",
      role: "Designer, UI/UX Design",
      status: "Offline",
      date: "14/06/21",
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F2C] via-[#0F1F4B] to-[#162C72] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* --- Header Stats --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { title: "Total Volunteers", value: "120", change: "+5%" },
            { title: "Active Volunteers", value: "2,300", change: "+0.5%" },
            { title: "Available Volunteers", value: "2,300", change: "+5%" },
          ].map((stat) => (
            <div
              key={stat.title}
              className="bg-[#101B3C]/70 rounded-2xl p-6 border border-white/10 backdrop-blur-md"
            >
              <h3 className="text-gray-300 text-sm">{stat.title}</h3>
              <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              <span className="text-emerald-400 text-xs">{stat.change}</span>
            </div>
          ))}
        </div>

        {/* --- Volunteer List --- */}
        <div className="bg-[#101B3C]/70 border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold">Volunteer List</h2>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm">
              Add Evacuation Center
            </button>
          </div>

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

        {/* --- Map & Center Detail --- */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-[#101B3C]/70 rounded-2xl border border-white/10 backdrop-blur-md h-96 flex items-center justify-center text-gray-400">
            <MapPin className="w-10 h-10 text-indigo-400 mr-2" />
            Map Placeholder (Google Maps Embed or Leaflet)
          </div>

          {/* Detail Card */}
          <div className="bg-[#101B3C]/70 border border-white/10 rounded-2xl backdrop-blur-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">Evacuation Center Detail</h2>
            <p className="text-sm text-gray-400">
              Center Detail Panel (on click)
              <br />• Shows capacity, available supplies, contact, and occupancy
            </p>
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Current Load</span>
                <span className="text-emerald-400 font-semibold">68%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Battery Health</span>
                <span className="text-gray-200">76%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Efficiency</span>
                <span className="text-blue-400">+20%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Consumption</span>
                <span className="text-gray-200">163W/km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">This Week</span>
                <span className="text-gray-200">1.34km</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
