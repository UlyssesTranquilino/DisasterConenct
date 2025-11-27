import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Search, Edit2, Plus, Trash2, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from "../../lib/auth";
import {
  evacuationCenterService,
  type EvacuationCenter,
  type CreateEvacuationCenterData,
} from "../../services/evacuationCenterService";

const cardGradientStyle = {
  background:
    "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

// --- Custom Lucide Marker Icon ---
const createLucideMarker = (color: string) =>
  L.divIcon({
    html: `
      <div style="display:flex;justify-content:center;align-items:center;transform:translate(-50%,-100%)">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" 
             viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" 
             class="lucide lucide-map-pin drop-shadow-md">
          <path d="M12 21s8-4.5 8-10a8 8 0 1 0-16 0c0 5.5 8 10 8 10z"/>
          <circle cx="12" cy="11" r="3"/>
        </svg>
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [-16, -55],
  });

// --- Fly To ---
const FlyToLocation = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  if (position) map.flyTo(position, 14, { duration: 2 });
  return null;
};

// --- Edit Modal ---
const EditCenterModal = ({
  center,
  onSave,
  isLoading = false,
}: {
  center: EvacuationCenter;
  onSave: (updated: EvacuationCenter) => void;
  isLoading?: boolean;
}) => {
  const [form, setForm] = useState(center);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name === "capacity" || name === "occupied" ? Number(value) : value,
    });
  };

  const handleSave = () => {
    onSave(form);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <Edit2 size={12} className="mr-1" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border border-neutral-700 text-white">
        <DialogHeader>
          <DialogTitle>Edit Evacuation Center</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div>
            <Label>Name</Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="bg-neutral-800 border-neutral-700"
            />
          </div>
          <div>
            <Label>Address</Label>
            <Input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="bg-neutral-800 border-neutral-700"
            />
          </div>
          <div>
            <Label>Head / Person in Charge</Label>
            <Input
              name="head"
              value={form.head}
              onChange={handleChange}
              className="bg-neutral-800 border-neutral-700"
            />
          </div>
          <div>
            <Label>Contact</Label>
            <Input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              className="bg-neutral-800 border-neutral-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Capacity</Label>
              <Input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
            <div>
              <Label>Occupied</Label>
              <Input
                type="number"
                name="occupied"
                value={form.occupied}
                onChange={handleChange}
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Latitude</Label>
              <Input
                type="number"
                step="any"
                name="lat"
                value={form.lat}
                onChange={handleChange}
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                type="number"
                step="any"
                name="lng"
                value={form.lng}
                onChange={handleChange}
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
          </div>
        </div>
        <Button
          onClick={handleSave}
          className="mt-2 bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

// --- Create Center Modal ---
const CreateCenterModal = ({
  onSave,
  isLoading = false,
}: {
  onSave: (data: CreateEvacuationCenterData) => void;
  isLoading?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<CreateEvacuationCenterData>({
    name: "",
    address: "",
    head: "",
    contact: "",
    capacity: 0,
    occupied: 0,
    lat: 14.5995,
    lng: 120.9842,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name === "capacity" ||
        name === "occupied" ||
        name === "lat" ||
        name === "lng"
          ? Number(value)
          : value,
    });
  };

  const handleSave = async () => {
    await onSave(form);
    setIsOpen(false);
    // Reset form
    setForm({
      name: "",
      address: "",
      head: "",
      contact: "",
      capacity: 0,
      occupied: 0,
      lat: 14.5995,
      lng: 120.9842,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus size={16} className="mr-1" /> Add Center
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border border-neutral-700 text-white">
        <DialogHeader>
          <DialogTitle>Create New Evacuation Center</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div>
            <Label>Name *</Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="bg-neutral-800 border-neutral-700"
              placeholder="Enter center name"
            />
          </div>
          <div>
            <Label>Address *</Label>
            <Input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="bg-neutral-800 border-neutral-700"
              placeholder="Enter full address"
            />
          </div>
          <div>
            <Label>Head / Person in Charge</Label>
            <Input
              name="head"
              value={form.head}
              onChange={handleChange}
              className="bg-neutral-800 border-neutral-700"
              placeholder="Enter person in charge"
            />
          </div>
          <div>
            <Label>Contact</Label>
            <Input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              className="bg-neutral-800 border-neutral-700"
              placeholder="Enter contact number"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Capacity *</Label>
              <Input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                className="bg-neutral-800 border-neutral-700"
                placeholder="0"
              />
            </div>
            <div>
              <Label>Currently Occupied</Label>
              <Input
                type="number"
                name="occupied"
                value={form.occupied}
                onChange={handleChange}
                className="bg-neutral-800 border-neutral-700"
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Latitude *</Label>
              <Input
                type="number"
                step="any"
                name="lat"
                value={form.lat}
                onChange={handleChange}
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
            <div>
              <Label>Longitude *</Label>
              <Input
                type="number"
                step="any"
                name="lng"
                value={form.lng}
                onChange={handleChange}
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
          </div>
        </div>
        <Button
          onClick={handleSave}
          className="mt-2 bg-blue-700"
          disabled={isLoading || !form.name || !form.address || !form.capacity}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Create Center"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

// --- Map Component ---
const EvacuationCentersMap = ({ centers }: { centers: EvacuationCenter[] }) => {
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number] | null
  >(null);

  const center: [number, number] = [14.5995, 120.9842];

  return (
    <MapContainer center={center} zoom={12} className="h-[500px] rounded-xl">
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
      />
      <FlyToLocation position={selectedPosition} />

      {centers.map((c) => {
        const utilization = Math.round((c.occupied / c.capacity) * 100);
        const color =
          utilization > 90
            ? "#ef4444"
            : utilization > 70
            ? "#f59e0b"
            : "#22c55e";

        return (
          <Marker
            key={c.id}
            position={[c.lat, c.lng]}
            icon={createLucideMarker(color)}
          >
            <Popup>
              <div className="text-white w-[220px]">
                <h3 className="font-semibold text-blue-400 text-sm mb-1">
                  🏠 {c.name}
                </h3>
                <p className="text-xs text-neutral-300">📍 {c.address}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Head: <span className="text-white">{c.head}</span>
                </p>
                <p className="text-xs text-neutral-400 mt-1">☎️ {c.contact}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Capacity:{" "}
                  <span className="text-white">
                    {c.occupied} / {c.capacity} ({utilization}%)
                  </span>
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

// --- Main Page ---
export default function OrgEvacuationCentersPage() {
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const { currentUser } = useAuth(); // Get the current user from your auth context

  // Set organization ID when user is loaded
  useEffect(() => {
    if (currentUser?.id) {
      setOrganizationId(currentUser.id);
    }
  }, [currentUser]);

  // Fetch centers when organizationId changes
  useEffect(() => {
    if (organizationId) {
      fetchCenters();
    }
  }, [organizationId]);

  const fetchCenters = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await evacuationCenterService.getEvacuationCenters(
        organizationId
      );
      setCenters(data);
    } catch (err) {
      console.error("Error fetching centers:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch centers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCenter = async (data: CreateEvacuationCenterData) => {
    if (!organizationId) {
      setError("No organization ID available");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await evacuationCenterService.createEvacuationCenter(
        organizationId,
        data
      );
      await fetchCenters(); // Refresh the list
    } catch (err) {
      console.error("Error creating center:", err);
      setError(err instanceof Error ? err.message : "Failed to create center");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCenter = async (updatedCenter: EvacuationCenter) => {
    if (!organizationId) {
      setError("No organization ID available");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const { id, ...updateData } = updatedCenter;
      await evacuationCenterService.updateEvacuationCenter(
        organizationId,
        id,
        updateData
      );
      setCenters((prev) => prev.map((c) => (c.id === id ? updatedCenter : c)));
    } catch (err) {
      console.error("Error updating center:", err);
      setError(err instanceof Error ? err.message : "Failed to update center");
      await fetchCenters();
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCenter = async (centerId: string) => {
    if (!organizationId) {
      setError("No organization ID available");
      return;
    }

    if (!confirm("Are you sure you want to delete this evacuation center?")) {
      return;
    }

    try {
      setError(null);
      await evacuationCenterService.deleteEvacuationCenter(
        organizationId,
        centerId
      );
      await fetchCenters();
    } catch (err) {
      console.error("Error deleting center:", err);
      setError(err instanceof Error ? err.message : "Failed to delete center");
    }
  };

  // Filter centers based on search term
  const filteredCenters = centers.filter(
    (center) =>
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (center.address &&
        center.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (center.head &&
        center.head.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Loading evacuation centers...</span>
      </div>
    );
  }
  return (
    <div className="px-2 md:px-4 space-y-4 text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Evacuation Centers</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-2 py-[5px]">
            <Search size={14} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search centers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none w-32 md:w-48"
            />
          </div>
          <CreateCenterModal onSave={handleCreateCenter} isLoading={saving} />
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
            onClick={fetchCenters}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Table */}
      <Card className="border-0" style={cardGradientStyle}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-white">
            Evacuation Center List ({filteredCenters.length} centers)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCenters.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchTerm
                ? "No centers match your search."
                : "No evacuation centers found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase bg-neutral-900/70 text-neutral-400">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Address</th>
                    <th className="px-4 py-2">Head</th>
                    <th className="px-4 py-2">Contact</th>
                    <th className="px-4 py-2">Capacity</th>
                    <th className="px-4 py-2">Occupied</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCenters.map((center) => (
                    <tr
                      key={center.id}
                      className="border-b border-neutral-800 hover:bg-neutral-800/50 transition"
                    >
                      <td className="px-4 py-2 text-white">{center.name}</td>
                      <td className="px-4 py-2">{center.address}</td>
                      <td className="px-4 py-2">{center.head}</td>
                      <td className="px-4 py-2">{center.contact}</td>
                      <td className="px-4 py-2">{center.capacity}</td>
                      <td className="px-4 py-2">{center.occupied}</td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <EditCenterModal
                          center={center}
                          onSave={handleUpdateCenter}
                          isLoading={saving}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs text-red-400 border-red-800 hover:bg-red-900/50"
                          onClick={() => handleDeleteCenter(center.id)}
                          disabled={saving}
                        >
                          <Trash2 size={12} className="mr-1" /> Delete
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

      {/* Map Section */}
      <Card className="border-0" style={cardGradientStyle}>
        <CardHeader className="pb-2 flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-white">
            Centers Map Overview
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-neutral-300">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 bg-green-500 rounded-full"></span>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 bg-yellow-500 rounded-full"></span>
              <span>Almost Full</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 bg-red-500 rounded-full"></span>
              <span>Full</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EvacuationCentersMap centers={centers} />
        </CardContent>
      </Card>
    </div>
  );
}
