import React, { useState } from "react";
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
import { Search, Edit2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

// --- Mock Data ---
interface Center {
  id: number;
  name: string;
  address: string;
  head: string;
  contact: string;
  capacity: number;
  occupied: number;
  lat: number;
  lon: number;
}

const initialCenters: Center[] = [
  {
    id: 1,
    name: "Quezon City Hall Evac Center",
    address: "Elliptical Road, QC",
    head: "Engr. Maria Santos",
    contact: "0917-888-1234",
    capacity: 500,
    occupied: 420,
    lat: 14.6488,
    lon: 121.0509,
  },
  {
    id: 2,
    name: "Pasig Sports Complex",
    address: "Shaw Blvd., Pasig",
    head: "Juan Dela Cruz",
    contact: "0917-555-9922",
    capacity: 800,
    occupied: 760,
    lat: 14.5733,
    lon: 121.0851,
  },
  {
    id: 3,
    name: "Taguig Gymnasium",
    address: "Bonifacio, Taguig",
    head: "Karla Mendoza",
    contact: "0917-555-4488",
    capacity: 600,
    occupied: 480,
    lat: 14.5202,
    lon: 121.0566,
  },
  {
    id: 4,
    name: "Manila City College Grounds",
    address: "Taft Ave., Manila",
    head: "Ar. Robert Reyes",
    contact: "0919-333-2211",
    capacity: 1000,
    occupied: 950,
    lat: 14.5995,
    lon: 120.9842,
  },
];

// --- Edit Modal ---
const EditCenterModal = ({
  center,
  onSave,
}: {
  center: Center;
  onSave: (updated: Center) => void;
}) => {
  const [form, setForm] = useState(center);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        </div>
        <Button onClick={handleSave} className="mt-2 bg-blue-700">
          Save Changes
        </Button>
      </DialogContent>
    </Dialog>
  );
};

// --- Map Component ---
const EvacuationCentersMap = ({ centers }: { centers: Center[] }) => {
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
            position={[c.lat, c.lon]}
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
  const [centers, setCenters] = useState<Center[]>(initialCenters);

  const handleSave = (updated: Center) => {
    setCenters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  return (
    <div className="px-2 md:px-4 space-y-4 text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Evacuation Centers</h1>
        <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-2 py-[5px]">
          <Search size={14} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none w-32 md:w-48"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="border-0" style={cardGradientStyle}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-white">
            Evacuation Center List
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                {centers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-neutral-800 hover:bg-neutral-800/50 transition"
                  >
                    <td className="px-4 py-2 text-white">{c.name}</td>
                    <td className="px-4 py-2">{c.address}</td>
                    <td className="px-4 py-2">{c.head}</td>
                    <td className="px-4 py-2">{c.contact}</td>
                    <td className="px-4 py-2">{c.capacity}</td>
                    <td className="px-4 py-2">{c.occupied}</td>
                    <td className="px-4 py-2 text-right">
                      <EditCenterModal center={c} onSave={handleSave} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
