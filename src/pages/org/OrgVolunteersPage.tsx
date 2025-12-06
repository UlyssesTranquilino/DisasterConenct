import { useState, useEffect } from "react";
import { organizationService } from "../../services/organizationService";
import { useOrganization } from "../../contexts/OrganizationContext";
import { Volunteer, VolunteerStatus } from "../../services/organizationService";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/components/ui/badge";
import { User, Shield, Phone, MapPin, Loader2, Search } from "lucide-react";

const statusColors = {
  Active: "bg-green-100 text-green-800",
  "On Duty": "bg-blue-100 text-blue-800",
  Standby: "bg-yellow-100 text-yellow-800",
};

export default function OrgVolunteersPage() {
  const { currentOrgId } = useOrganization();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchVolunteers = async () => {
    if (!currentOrgId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await organizationService.getVolunteers(currentOrgId);
      setVolunteers(data);
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
  }, [currentOrgId]);

  const handleStatusChange = async (
    volunteerId: string,
    newStatus: VolunteerStatus
  ) => {
    if (!currentOrgId) return;

    try {
      await organizationService.updateVolunteerStatus(
        currentOrgId,
        volunteerId,
        newStatus
      );
      // Update local state to reflect the change
      setVolunteers((prev) =>
        prev.map((v) =>
          v.id === volunteerId ? { ...v, status: newStatus } : v
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update volunteer status"
      );
      console.error("Error updating volunteer status:", err);
    }
  };

  const filteredVolunteers = volunteers.filter(
    (volunteer) =>
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Volunteers</h1>
          <p className="text-gray-500">Manage your organization's volunteers</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search volunteers..."
            className="pl-10 pr-4 py-2 border rounded-md w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVolunteers.length > 0 ? (
                filteredVolunteers.map((volunteer) => (
                  <tr key={volunteer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {volunteer.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {volunteer.contact}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {volunteer.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {volunteer.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusColors[volunteer.status]}>
                        {volunteer.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <select
                        value={volunteer.status}
                        onChange={(e) =>
                          handleStatusChange(
                            volunteer.id!,
                            e.target.value as VolunteerStatus
                          )
                        }
                        className="text-sm border rounded p-1"
                      >
                        {Object.keys(statusColors).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <User className="w-12 h-12 text-gray-300 mb-2" />
                      <p>No volunteers found</p>
                      {searchTerm && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => setSearchTerm("")}
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
