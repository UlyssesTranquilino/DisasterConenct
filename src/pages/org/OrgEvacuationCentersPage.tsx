import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
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
import { Search, Edit2, Plus, Trash2, Loader2, MapPin } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useOrganization } from "../../contexts/OrganizationContext";
import {
  evacuationCenterService,
  type EvacuationCenter,
  type CreateEvacuationCenterData,
} from "../../services/evacuationCenterService";

// Fix for Leaflet default icon using CDN URLs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

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

// Separate Map Picker component for Edit Modal
interface MapPickerProps {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
  centerName?: string;
  centerAddress?: string;
}

const MapPicker: React.FC<MapPickerProps> = ({
  position,
  onPositionChange,
  centerName = "New Evacuation Center",
  centerAddress = "Set address",
}) => {
  const [mapKey, setMapKey] = useState(0); // Key to force re-render
  const mapRef = useRef<any>(null);

  const LocationPicker = () => {
    useMapEvents({
      click(e) {
        onPositionChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  useEffect(() => {
    // Reset map key when dialog opens
    setMapKey((prev) => prev + 1);
  }, []);

  return (
    <MapContainer
      key={mapKey}
      center={position}
      zoom={13}
      className="h-64 rounded-xl mt-2"
      ref={mapRef}
      whenReady={() => {
        const mapInstance = mapRef.current;
        if (mapInstance) {
          // Small delay to ensure map is fully rendered
          setTimeout(() => {
            mapInstance.invalidateSize();
          }, 100);
        }
      }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
      />
      <LocationPicker />
      <Marker position={position} icon={createLucideMarker("#3b82f6")}>
        <Popup>
          <div className="text-xs text-white">
            {centerName}
            <br />
            {centerAddress}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

// Separate Map Picker Dialog component
const MapPickerDialog = ({
  isOpen,
  onOpenChange,
  initialPosition,
  onSave,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialPosition: [number, number];
  onSave: (lat: number, lng: number) => void;
}) => {
  const [position, setPosition] = useState<[number, number]>(initialPosition);

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
  };

  const handleSave = () => {
    onSave(position[0], position[1]);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-900 border border-neutral-700 text-white max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Location on Map</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <MapPicker
            position={position}
            onPositionChange={handleMapClick}
            centerName="Selected Location"
            centerAddress={`Lat: ${position[0].toFixed(
              6
            )}, Lng: ${position[1].toFixed(6)}`}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
            <div>
              <Label>Latitude</Label>
              <Input
                type="number"
                step="any"
                value={position[0]}
                onChange={(e) =>
                  setPosition([parseFloat(e.target.value) || 0, position[1]])
                }
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                type="number"
                step="any"
                value={position[1]}
                onChange={(e) =>
                  setPosition([position[0], parseFloat(e.target.value) || 0])
                }
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
          </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-neutral-700"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-700">
            <MapPin size={16} className="mr-2" />
            Use This Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
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
  const [isOpen, setIsOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name === "capacity" || name === "occupied" ? Number(value) : value,
    });
  };

  const handleMapSelect = (lat: number, lng: number) => {
    setForm((prev) => ({
      ...prev,
      lat,
      lng,
    }));
  };

  const handleSave = () => {
    onSave(form);
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <Edit2 size={12} className="mr-1" /> Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-neutral-900 border border-neutral-700 text-white max-w-lg">
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
            {/* Map picker button */}
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full border-neutral-700 hover:bg-neutral-800"
                onClick={() => setIsMapPickerOpen(true)}
              >
                <MapPin size={16} className="mr-2" />
                Pick Location on Map
              </Button>
              <div className="text-xs text-neutral-400 mt-1">
                {typeof form.lat === "number" && typeof form.lng === "number"
                  ? `Current: ${form.lat.toFixed(6)}, ${form.lng.toFixed(6)}`
                  : "Current: not set"}
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

      {/* Separate Map Picker Dialog */}
      <MapPickerDialog
        isOpen={isMapPickerOpen}
        onOpenChange={setIsMapPickerOpen}
        initialPosition={[form.lat, form.lng]}
        onSave={handleMapSelect}
      />
    </>
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
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
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
  const [facilitiesInput, setFacilitiesInput] = useState("");

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

  const handleMapSelect = (lat: number, lng: number) => {
    setForm({
      ...form,
      lat,
      lng,
    });
  };

  const handleSave = async () => {
    const facilities = facilitiesInput
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    await onSave({
      ...form,
      facilities,
    });
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
    setFacilitiesInput("");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus size={16} className="mr-1" /> Add Center
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-neutral-900 border border-neutral-700 text-white max-w-lg">
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
            <div>
              <Label>Facilities (comma-separated)</Label>
              <Input
                name="facilities"
                value={facilitiesInput}
                onChange={(e) => setFacilitiesInput(e.target.value)}
                className="bg-neutral-800 border-neutral-700"
                placeholder="Medical Station, Kitchen, Wifi"
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
            {/* Map picker button */}
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full border-neutral-700 hover:bg-neutral-800"
                onClick={() => setIsMapPickerOpen(true)}
              >
                <MapPin size={16} className="mr-2" />
                Pick Location on Map
              </Button>
              <div className="text-xs text-neutral-400 mt-1">
                Current: {form.lat.toFixed(6)}, {form.lng.toFixed(6)}
              </div>
            </div>
          </div>
          <Button
            onClick={handleSave}
            className="mt-2 bg-blue-700"
            disabled={
              isLoading || !form.name || !form.address || !form.capacity
            }
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create Center"
            )}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Separate Map Picker Dialog for Create */}
      <MapPickerDialog
        isOpen={isMapPickerOpen}
        onOpenChange={setIsMapPickerOpen}
        initialPosition={[form.lat, form.lng]}
        onSave={handleMapSelect}
      />
    </>
  );
};

// --- Main Map Component ---
const EvacuationCentersMap = ({ centers }: { centers: EvacuationCenter[] }) => {
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef<any>(null);

  const center: [number, number] = [14.5995, 120.9842];

  // Re-initialize map when centers change
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 100);
    }
  }, [centers]);

  return (
    <MapContainer
      key={mapKey}
      center={center}
      zoom={12}
      className="h-[500px] rounded-xl"
      ref={mapRef}
      whenReady={() => {
        // Map is ready, mapRef.current should be set by ref
      }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
      />
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
  // Backend infers organization from authenticated user (JWT);
  // no need to send orgId explicitly from frontend.
  const { currentOrgId } = useOrganization();
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch centers on mount (org inferred from JWT on backend)
  useEffect(() => {
    fetchCenters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      setError(null);
      // ✅ FIX APPLIED: Use the organization-specific GET endpoint function
      // Assumes you added getOrganizationCenters to evacuationCenterService
      const data = await evacuationCenterService.getOrganizationCenters();
      setCenters(data);
    } catch (err) {
      console.error("Error fetching centers:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch centers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCenter = async (data: CreateEvacuationCenterData) => {
    try {
      setSaving(true);
      setError(null);
      await evacuationCenterService.createEvacuationCenter(data);
      await fetchCenters(); // Refresh the list

      toast.success("Evacuation center created", {
        description: data.name,
      });
    } catch (err) {
      console.error("Error creating center:", err);
      setError(err instanceof Error ? err.message : "Failed to create center");
      toast.error("Failed to create center", {
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      });
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCenter = async (updatedCenter: EvacuationCenter) => {
    try {
      setSaving(true);
      setError(null);

      const { id, ...updateData } = updatedCenter;

      const response = await evacuationCenterService.updateEvacuationCenter(
        id,
        updateData
      );

      const newCenter = response.center ?? updatedCenter;

      setCenters((prev) => prev.map((c) => (c.id === id ? newCenter : c)));

      toast.success("Evacuation center updated", {
        description: newCenter.name,
      });
    } catch (err) {
      console.error("Error updating center:", err);
      setError(err instanceof Error ? err.message : "Failed to update center");
      toast.error("Failed to update center", {
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      });
      await fetchCenters();
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCenter = async (centerId: string) => {
    if (!confirm("Are you sure you want to delete this evacuation center?")) {
      return;
    }

    try {
      setError(null);

      await evacuationCenterService.deleteEvacuationCenter(centerId);

      setCenters((prev) => prev.filter((c) => c.id !== centerId));

      toast.success("Evacuation center deleted", {
        description: "The center has been removed.",
      });
    } catch (err) {
      console.error("Error deleting center:", err);
      setError(err instanceof Error ? err.message : "Failed to delete center");
      toast.error("Failed to delete center", {
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      });
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
      <div className="px-2 md:px-4 space-y-4 text-white">
        <div className="flex justify-between items-center">
          <div className="h-6 w-40 bg-neutral-800/80 rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-2 py-[5px] w-40 animate-pulse">
              <Search size={14} className="text-gray-500 mr-2" />
              <div className="h-4 flex-1 bg-neutral-800 rounded" />
            </div>
            <div className="h-9 w-28 bg-blue-900/70 rounded-md animate-pulse" />
        </div>
        </div>

        {/* Table skeleton */}
        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader>
            <div className="h-4 w-56 bg-neutral-800/80 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-neutral-800/80 pb-2"
                >
                  <div className="space-y-1 flex-1">
                    <div className="h-3 w-40 bg-neutral-800/80 rounded animate-pulse" />
                    <div className="h-3 w-64 bg-neutral-900/80 rounded animate-pulse" />
                  </div>
                  <div className="flex gap-2 ml-4">
                    <div className="h-7 w-16 bg-neutral-800/80 rounded animate-pulse" />
                    <div className="h-7 w-16 bg-neutral-900/80 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Map skeleton */}
        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader className="pb-2 flex justify-between items-center">
            <div className="h-4 w-48 bg-neutral-800/80 rounded animate-pulse" />
            <div className="flex items-center gap-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="h-2 w-2 bg-neutral-700 rounded-full" />
                  <span className="h-3 w-16 bg-neutral-800/80 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full rounded-xl bg-neutral-900/80 animate-pulse" />
          </CardContent>
        </Card>
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