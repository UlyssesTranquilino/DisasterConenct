import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { organizationService } from "../../services/organizationService";
import { useOrganization } from "../../contexts/OrganizationContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

export default function OrgAddCenterPage() {
  const { currentOrgId } = useOrganization();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    head: "",
    contact: "",
    capacity: 100,
    occupied: 0,
    lat: 0,
    lon: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "capacity" ||
        name === "occupied" ||
        name === "lat" ||
        name === "lon"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrgId) return;

    setLoading(true);
    setError(null);

    try {
      await organizationService.createEvacuationCenter(currentOrgId, formData);
      navigate("/org/centers");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create evacuation center"
      );
      console.error("Error creating center:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Centers
      </Button>

      <h1 className="text-2xl font-bold mb-6">Add New Evacuation Center</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Center Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="mt-1"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="head">Head of Center</Label>
            <Input
              id="head"
              name="head"
              value={formData.head}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="contact">Contact Information</Label>
            <Input
              id="contact"
              name="contact"
              type="tel"
              value={formData.contact}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="capacity">Total Capacity</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="occupied">Currently Occupied</Label>
            <Input
              id="occupied"
              name="occupied"
              type="number"
              min="0"
              max={formData.capacity}
              value={formData.occupied}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="lat">Latitude</Label>
            <Input
              id="lat"
              name="lat"
              type="number"
              step="any"
              value={formData.lat}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="lon">Longitude</Label>
            <Input
              id="lon"
              name="lon"
              type="number"
              step="any"
              value={formData.lon}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/org/centers")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Center"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
