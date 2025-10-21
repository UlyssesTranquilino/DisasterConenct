import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search, Layers } from "lucide-react";

// --- Custom Lucide Marker Icon ---
const createLucideMarker = (color: string) =>
  L.divIcon({
    html: `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <svg xmlns="http://www.w3.org/2000/svg"
             width="32" height="32"
             viewBox="0 0 24 24"
             fill="none"
             stroke="${color}"
             stroke-width="2"
             stroke-linecap="round"
             stroke-linejoin="round"
             class="lucide lucide-map-pin drop-shadow-md">
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

// --- Helper to Fly Map to New Location ---
const FlyToLocation = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  if (position) {
    map.flyTo(position, 14, { duration: 2 });
  }
  return null;
};

const DisasterMap: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number] | null
  >(null);

  const center: [number, number] = [14.5995, 120.9842]; // Manila

  // --- Fetch location data from Nominatim API ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}`
    );
    const data = await response.json();
    setSearchResults(data);
  };

  const handleSelectResult = (result: any) => {
    const position: [number, number] = [
      parseFloat(result.lat),
      parseFloat(result.lon),
    ];
    setSelectedPosition(position);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  return (
    <div className="relative h-full w-full">
      {/* 🔍 Search Bar */}
      <div className="absolute top-6 right-6 z-[1000] w-80">
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-black/70 border border-neutral-700 rounded-lg p-2 backdrop-blur-md"
        >
          <Search size={16} className="text-neutral-400 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location..."
            className="bg-transparent text-white text-sm w-full outline-none placeholder:text-neutral-500"
          />
          <Layers
            size={16}
            className="text-neutral-400 ml-2 cursor-pointer hover:text-white transition"
          />
        </form>

        {/* 🧭 Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute mt-1 w-full bg-neutral-900/90 border border-neutral-700 rounded-lg max-h-60 overflow-auto shadow-lg">
            {searchResults.slice(0, 5).map((result, i) => (
              <div
                key={i}
                onClick={() => handleSelectResult(result)}
                className="p-2 text-sm text-neutral-300 hover:bg-neutral-800 cursor-pointer"
              >
                {result.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🗺️ Map */}
      <MapContainer
        center={center}
        zoom={12}
        className="h-full w-full rounded-xl z-0 overflow-hidden"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        />

        {/* Fly to searched location */}
        <FlyToLocation position={selectedPosition} />

        {/* 📍 Search result marker */}
        {selectedPosition && (
          <Marker
            position={selectedPosition}
            icon={createLucideMarker("#60a5fa")}
          >
            <Popup>
              <div className="text-white w-[200px]">
                <h3 className="font-semibold text-blue-400 text-sm mb-1">
                  📍 {searchQuery}
                </h3>
                <p className="text-xs text-neutral-400">Searched Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 📍 Predefined Points */}
        <Marker position={[14.61, 120.98]} icon={createLucideMarker("#f59e0b")}>
          <Popup>
            <div className="text-white w-[200px]">
              <h3 className="font-semibold text-orange-400 text-sm mb-1">
                🏠 Evacuation Center
              </h3>
              <div className="border-t border-neutral-700 my-2"></div>
              <p className="text-xs text-neutral-300">📍 Intramuros</p>
              <p className="text-xs text-neutral-400 mt-1">
                Capacity: <span className="text-white">350 / 500</span>
              </p>
            </div>
          </Popup>
        </Marker>

        <Marker
          position={[14.604, 120.99]}
          icon={createLucideMarker("#ef4444")}
        >
          <Popup>
            <div className="text-white w-[200px]">
              <h3 className="font-semibold text-red-400 text-sm mb-1">
                🆘 Urgent Help Needed
              </h3>
              <div className="border-t border-neutral-700 my-2"></div>
              <p className="text-xs text-neutral-300">📍 Ermita</p>
              <p className="text-xs text-neutral-400 mt-1">
                Request: <span className="text-white">Food & Medical Aid</span>
              </p>
            </div>
          </Popup>
        </Marker>

        <Marker
          position={[14.59, 120.975]}
          icon={createLucideMarker("#22c55e")}
        >
          <Popup>
            <div className="text-white w-[200px]">
              <h3 className="font-semibold text-green-400 text-sm mb-1">
                💪 Volunteer Group
              </h3>
              <div className="border-t border-neutral-700 my-2"></div>
              <p className="text-xs text-neutral-300">📍 Paco</p>
              <p className="text-xs text-neutral-400 mt-1">
                Members: <span className="text-white">8 Active</span>
              </p>
              <p className="text-xs text-neutral-400">
                Contact: <span className="text-white">Team Alpha</span>
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default DisasterMap;
