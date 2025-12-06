import { useState, useEffect } from "react";
import {
  organizationService,
  Volunteer,
  VolunteerStatus,
} from "../../services/organizationService";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/components/ui/badge";
import { User, Phone, MapPin, Loader2, Search, Pencil } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";

const statusColors: Record<VolunteerStatus, string> = {
  Active: "bg-green-100 text-green-800",
  "On Duty": "bg-blue-100 text-blue-800",
  Standby: "bg-yellow-100 text-yellow-800",
};

const cardGradientStyle = {
  background:
    "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

export default function OrgVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchVolunteers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await organizationService.getOrgVolunteers();
      setVolunteers(res.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch volunteers"
      );
      console.error("Error fetching volunteers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleStatusChange = (
    volunteerId: string,
    newStatus: VolunteerStatus
  ) => {
    setVolunteers((prev) =>
      prev.map((v) => (v.id === volunteerId ? { ...v, status: newStatus } : v))
    );
  };

  const filteredVolunteers = volunteers.filter(
    (volunteer) =>
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="px-2 md:px-4 space-y-4 text-white">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-6 w-40 bg-neutral-800/80 rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-2 py-[5px] w-40 animate-pulse">
              <Search size={14} className="text-gray-500 mr-2" />
              <div className="h-4 flex-1 bg-neutral-800 rounded" />
            </div>
          </div>
        </div>

        {/* Summary cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="border-0" style={cardGradientStyle}>
              <CardHeader className="pb-2">
                <div className="h-4 w-32 bg-neutral-800/80 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-6 w-24 bg-neutral-800/80 rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-neutral-900/80 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table skeleton */}
        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader>
            <div className="h-4 w-40 bg-neutral-800/80 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-neutral-800/80 pb-2"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-neutral-800 animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-3 w-32 bg-neutral-800/80 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-neutral-900/80 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <div className="h-6 w-20 bg-neutral-800/80 rounded-full animate-pulse" />
                    <div className="h-7 w-24 bg-neutral-900/80 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-2 md:px-4 space-y-6 text-white">
      {/* --- Header --- */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Volunteers</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-2 py-[5px]">
            <Search size={14} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search volunteers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none w-32 md:w-48"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
          <strong>Error: </strong>
          {error}
          <Button
            variant="outline"
            size="sm"
            className="ml-4 border-red-600 text-red-200"
            onClick={fetchVolunteers}
          >
            Retry
          </Button>
        </div>
      )}

      {/* --- Summary Cards --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Volunteers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {volunteers.length}
            </div>
            <p className="text-xs text-neutral-400">
              Registered in your organization
            </p>
          </CardContent>
        </Card>

        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Active Volunteers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {volunteers.filter((v) => v.status === "Active").length}
            </div>
            <p className="text-xs text-neutral-400">Currently active</p>
          </CardContent>
        </Card>

        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">
              On Duty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {volunteers.filter((v) => v.status === "On Duty").length}
            </div>
            <p className="text-xs text-neutral-400">Currently assigned</p>
          </CardContent>
        </Card>

        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {volunteers.filter((v) => v.status === "Standby").length}
            </div>
            <p className="text-xs text-neutral-400">Ready for assignment</p>
          </CardContent>
        </Card>
      </div>

      {/* --- Main Table --- */}
      <Card className="border-0" style={cardGradientStyle}>
        <CardHeader>
          <CardTitle className="text-white text-sm font-medium">
            Volunteers List ({filteredVolunteers.length} volunteers)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVolunteers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchTerm
                ? "No volunteers match your search."
                : "No volunteers found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase bg-neutral-900/70 text-neutral-400">
                  <tr>
                    <th className="px-4 py-2">Volunteer</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Location</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVolunteers.map((volunteer) => (
                    <tr
                      key={volunteer.id}
                      className="border-b border-neutral-800 hover:bg-neutral-800/50 transition"
                    >
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center">
                            <User className="h-5 w-5 text-neutral-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {volunteer.name}
                            </div>
                            <div className="text-xs text-neutral-400 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {volunteer.contact}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">{volunteer.role}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-neutral-400" />
                          {volunteer.location}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <Badge className={statusColors[volunteer.status]}>
                          {volunteer.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <select
                          value={volunteer.status}
                          onChange={(e) =>
                            handleStatusChange(
                              volunteer.id!,
                              e.target.value as VolunteerStatus
                            )
                          }
                          className="bg-neutral-800 border border-neutral-700 text-white text-xs px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {Object.keys(statusColors).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() =>
                            console.log("Edit volunteer:", volunteer.id)
                          }
                        >
                          <Pencil size={14} />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
