import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "../../components/components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Plus, Pencil } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { cn } from "../../lib/utils";

const cardGradientStyle = {
  background:
    "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

type Volunteer = {
  id: number;
  name: string;
  role: string;
  contact: string;
  location: string;
  status: string;
};

// --- Custom Lucide Marker ---
const createLucideMarker = (color: string) =>
  L.divIcon({
    html: `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
             viewBox="0 0 24 24" fill="none" stroke="${color}"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             class="lucide lucide-map-pin drop-shadow-md">
          <path d="M12 21s8-4.5 8-10a8 8 0 1 0-16 0c0 5.5 8 10 8 10z"/>
          <circle cx="12" cy="11" r="3"/>
        </svg>
      </div>
    `,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [16, 32],
    popupAnchor: [-16, -50],
  });

export const OrgVolunteersPage = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([
    {
      id: 1,
      name: "Team Alpha",
      role: "Medical Support",
      contact: "0917-123-4567",
      location: "Manila",
      status: "Active",
    },
    {
      id: 2,
      name: "Rescue Unit 3",
      role: "Rescue",
      contact: "0917-888-9999",
      location: "Cavite",
      status: "On Duty",
    },
    {
      id: 3,
      name: "Relief Team North",
      role: "Logistics",
      contact: "0922-555-3333",
      location: "Quezon City",
      status: "Standby",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Volunteer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    contact: "",
    location: "",
    status: "",
  });

  const handleOpenAdd = () => {
    setEditing(null);
    setFormData({ name: "", role: "", contact: "", location: "", status: "" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (v: Volunteer) => {
    setEditing(v);
    setFormData({
      name: v.name,
      role: v.role,
      contact: v.contact,
      location: v.location,
      status: v.status,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      setVolunteers((prev) =>
        prev.map((v) => (v.id === editing.id ? { ...v, ...formData } : v))
      );
    } else {
      setVolunteers((prev) => [...prev, { id: prev.length + 1, ...formData }]);
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Volunteers</h1>
        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500"
        >
          <Plus size={14} /> Add Volunteer
        </Button>
      </div>

      {/* --- Top Small Cards --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader>
            <CardTitle className="text-sm text-white">
              Total Volunteers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-white font-bold">{volunteers.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader>
            <CardTitle className="text-sm text-white">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-green-400 font-bold">
              {volunteers.filter((v) => v.status === "Active").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader>
            <CardTitle className="text-sm text-white">On Duty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-blue-400 font-bold">
              {volunteers.filter((v) => v.status === "On Duty").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader>
            <CardTitle className="text-sm text-white">Standby</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-yellow-400 font-bold">
              {volunteers.filter((v) => v.status === "Standby").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- Volunteers Table --- */}
      <Card className="border-0" style={cardGradientStyle}>
        <CardHeader>
          <CardTitle className="text-white text-sm font-medium">
            Volunteer Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm text-left text-neutral-300">
            <thead className="text-xs uppercase text-neutral-400 border-b border-neutral-700">
              <tr>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Contact</th>
                <th className="py-2 px-3">Location</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-neutral-800 hover:bg-neutral-900/40"
                >
                  <td className="py-2 px-3">{v.name}</td>
                  <td className="py-2 px-3">{v.role}</td>
                  <td className="py-2 px-3">{v.contact}</td>
                  <td className="py-2 px-3">{v.location}</td>
                  <td
                    className={cn(
                      "py-2 px-3 font-semibold",
                      v.status === "Active"
                        ? "text-green-400"
                        : v.status === "On Duty"
                        ? "text-blue-400"
                        : "text-yellow-400"
                    )}
                  >
                    {v.status}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(v)}
                    >
                      <Pencil size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* --- Volunteer Map --- */}
      <Card className="border-0 h-[450px]" style={cardGradientStyle}>
        <CardHeader>
          <CardTitle className="text-white text-sm font-medium">
            Volunteer Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="h-full">
          <MapContainer
            center={[14.5995, 120.9842]}
            zoom={11}
            className="h-full w-full rounded-lg overflow-hidden"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            />
            {volunteers.map((v, i) => (
              <Marker
                key={i}
                position={[
                  14.59 + Math.random() * 0.04,
                  120.97 + Math.random() * 0.04,
                ]}
                icon={createLucideMarker(
                  v.status === "Active"
                    ? "#22c55e"
                    : v.status === "On Duty"
                    ? "#3b82f6"
                    : "#f59e0b"
                )}
              >
                <Popup>
                  <div className="text-white w-[180px]">
                    <h3 className="font-semibold text-blue-400 text-sm mb-1">
                      {v.name}
                    </h3>
                    <p className="text-xs text-neutral-400">{v.role}</p>
                    <p className="text-xs text-neutral-500 mt-1">{v.contact}</p>
                    <p className="text-xs text-neutral-500">{v.location}</p>
                    <p className="text-xs mt-1">
                      Status:{" "}
                      <span className="font-semibold text-green-400">
                        {v.status}
                      </span>
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </CardContent>
      </Card>

      {/* --- Dialog for Add/Edit Volunteer --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0b0f26] border border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editing ? "Edit Volunteer" : "Add Volunteer"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {["name", "role", "contact", "location", "status"].map((key) => (
              <div key={key} className="grid gap-2">
                <Label htmlFor={key}>
                  {key[0].toUpperCase() + key.slice(1)}
                </Label>
                <Input
                  id={key}
                  value={(formData as any)[key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                  placeholder={`Enter ${key}`}
                  className="bg-neutral-900 border-neutral-700 text-white"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-500"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
