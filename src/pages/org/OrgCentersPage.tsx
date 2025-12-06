import { useState, useEffect } from "react";
import { organizationService } from "../../services/organizationService";
import { useOrganization } from "../../contexts/OrganizationContext";
import { EvacuationCenter } from "../../services/organizationService";
import { Button } from "../../components/ui/button";
import { Plus, Loader2, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function OrgCentersPage() {
  const { currentOrgId } = useOrganization();
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCenters = async () => {
    if (!currentOrgId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await organizationService.getEvacuationCenters(currentOrgId);
      setCenters(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch evacuation centers"
      );
      console.error("Error fetching centers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, [currentOrgId]);

  if (loading) {
    return <div className="p-6">Loading evacuation centers...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={fetchCenters}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Evacuation Centers</h1>
        <Button asChild>
          <Link to="/org/centers/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Center
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {centers.map((center) => (
          <div key={center.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{center.name}</h3>
                <p className="text-sm text-gray-600 mt-1 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {center.address}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  center.occupied >= center.capacity
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {center.occupied}/{center.capacity}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span>Head: {center.head}</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Contact: {center.contact}
              </div>
            </div>
          </div>
        ))}
        {centers.length === 0 && (
          <p className="text-gray-500">No evacuation centers added yet.</p>
        )}
      </div>
    </div>
  );
}
