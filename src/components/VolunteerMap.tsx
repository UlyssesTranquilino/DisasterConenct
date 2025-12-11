import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, Layers } from 'lucide-react';
import { MapLocation } from "../lib/MapLocation";

// --- 1. Define Icons ---

// Custom Lucide Marker (Orange/Red/Green based on type)
const createLucideMarker = (color: string) =>
  L.divIcon({
    html: `
      <div style="display: flex; justify-content: center; align-items: center; transform: translate(-50%, -100%);">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin drop-shadow-md">
          <path d="M12 21s8-4.5 8-10a8 8 0 1 0-16 0c0 5.5 8 10 8 10z" />
          <circle cx="12" cy="11" r="3" />
        </svg>
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [-16, -55],
  });

// Blue Icon for User Location
const userIcon = L.divIcon({
  html: `
    <div style="display: flex; justify-content: center; align-items: center;">
      <div style="width: 16px; height: 16px; background-color: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);"></div>
      <div style="position: absolute; width: 32px; height: 32px; background-color: #3b82f6; border-radius: 50%; opacity: 0.2; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
    </div>
  `,
  className: "relative flex items-center justify-center",
  iconSize: [32, 32],
  iconAnchor: [16, 16], // Centered
});

// --- 2. Helper Components ---

// Smoothly fly to a location (Search or GPS)
const FlyToLocation = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
};

interface VolunteerMapProps {
  onLocationSelect?: (location: MapLocation) => void;
  centers?: MapLocation[];
  // New Prop for User Location
  userLocation?: { lat: number; lng: number } | null;
}

const defaultCenter: [number, number] = [14.5995, 120.9842]; // Manila

export default function VolunteerMap({ onLocationSelect, centers = [], userLocation }: VolunteerMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  // Fix leaflet map sizing issues
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // --- Search Logic ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleSelectResult = (result: any) => {
    const position: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)];
    setSelectedPosition(position);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'evacuation': return '#f59e0b'; // orange
      case 'urgent': return '#ef4444';     // red
      case 'volunteer': return '#22c55e';  // green
      default: return '#f59e0b';
    }
  };

  // Convert centers to map format
  const mapCenters = centers.map(center => ({
    ...center,
    position: center.coordinates ? [center.coordinates.lat, center.coordinates.lng] as [number, number] : center.position,
    type: center.type || 'evacuation'
  }));

  // Determine where to focus the map: Search Result > User Location > Default
  const focusPosition = selectedPosition || (userLocation ? [userLocation.lat, userLocation.lng] as [number, number] : null);

  return (
    <div className="relative h-full w-full">
      {/* 🔍 Search Bar */}
      <div className="absolute top-4 right-4 z-[1000] w-72 sm:w-80">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-neutral-900/90 border border-neutral-700 rounded-xl p-2.5 backdrop-blur-md shadow-xl"
        >
          <Search size={18} className="text-neutral-400 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location..."
            className="bg-transparent text-white text-sm w-full outline-none placeholder:text-neutral-500"
          />
          <Layers size={18} className="text-neutral-400 ml-2 cursor-pointer hover:text-white transition" />
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute mt-2 w-full bg-neutral-900 border border-neutral-700 rounded-xl max-h-60 overflow-auto shadow-2xl z-[1001]">
            {searchResults.slice(0, 5).map((result, i) => (
              <div
                key={i}
                onClick={() => handleSelectResult(result)}
                className="p-3 text-sm text-neutral-300 hover:bg-neutral-800 cursor-pointer border-b border-neutral-800 last:border-0"
              >
                {result.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🗺️ Map */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="h-full w-full z-0"
        scrollWheelZoom={true}
        zoomControl={false} // We can hide default zoom if we want a cleaner look
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        />

        {/* Dynamic Re-centering */}
        <FlyToLocation position={focusPosition} />

        {/* 🔵 User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup className="custom-popup">
              <div className="text-center">
                <strong className="text-blue-600 block mb-1">You Are Here</strong>
                <span className="text-xs text-neutral-500">Current Location</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 📍 Search Result Marker */}
        {selectedPosition && (
          <Marker position={selectedPosition} icon={createLucideMarker("#60a5fa")}>
            <Popup>
              <div className="text-sm font-semibold">Searched Location</div>
            </Popup>
          </Marker>
        )}

        {/* 🏠 Evacuation Centers */}
        {mapCenters.map((center) => (
          <Marker
            key={center.id}
            position={center.position}
            icon={createLucideMarker(getMarkerColor(center.type))}
            eventHandlers={{
              click: () => onLocationSelect?.(center),
            }}
          >
            <Popup>
              <div className="text-neutral-800 min-w-[180px]">
                <h3 className="font-bold text-base mb-1">{center.name}</h3>
                <p className="text-xs text-neutral-500 mb-2">{center.location}</p>
                <div className="flex justify-between items-center bg-neutral-100 p-2 rounded-lg">
                  <span className="text-xs font-semibold">Capacity</span>
                  <span className="text-xs">{center.capacity}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}