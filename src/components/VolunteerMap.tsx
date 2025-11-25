import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, Layers, Navigation } from 'lucide-react';

// --- Custom Lucide Marker Icon (same as DisasterMap) ---
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

// --- User Location Marker Icon ---
const createUserLocationMarker = () =>
  L.divIcon({
    html: `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        transform: translate(-50%, -50%);
      ">
        <div style="
          width: 20px;
          height: 20px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        "></div>
      </div>
    `,
    className: "user-location-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

// --- Helper to Fly Map to New Location ---
const FlyToLocation = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  if (position) {
    map.flyTo(position, 14, { duration: 2 });
  }
  return null;
};

// --- Helper to Fly to User Location ---
const FlyToUserLocation = ({ userLocation }: { userLocation: [number, number] | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 14, { duration: 2 });
    }
  }, [userLocation, map]);

  return null;
};

interface MapLocation {
  id: number;
  name: string;
  location: string;
  position: [number, number];
  capacity: number;
  supplies: string[];
  contact: string;
  occupancy: number;
  type?: 'evacuation' | 'urgent' | 'volunteer' | 'searched';
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface VolunteerMapProps {
  onLocationSelect?: (location: MapLocation) => void;
  centers?: MapLocation[];
  userLocation?: { lat: number; lng: number } | null;
}

const defaultCenter: [number, number] = [14.5995, 120.9842]; // Manila

// Default centers if none provided
const defaultEvacuationCenters: MapLocation[] = [
  {
    id: 1,
    name: "Central Evacuation Center",
    location: "Manila, Metro Manila",
    position: [14.61, 120.98],
    capacity: 500,
    supplies: ["Food", "Water", "Medical", "Blankets"],
    contact: "+1-555-0101",
    occupancy: 68,
    type: "evacuation",
    coordinates: { lat: 14.61, lng: 120.98 }
  },
  {
    id: 2,
    name: "Northside Shelter - URGENT",
    location: "Quezon City, Metro Manila",
    position: [14.604, 120.99],
    capacity: 300,
    supplies: ["Food", "Water", "Clothing"],
    contact: "+1-555-0102",
    occupancy: 95,
    type: "urgent",
    coordinates: { lat: 14.604, lng: 120.99 }
  },
  {
    id: 3,
    name: "Community Hall",
    location: "Makati, Metro Manila",
    position: [14.59, 120.975],
    capacity: 200,
    supplies: ["Food", "Medical"],
    contact: "+1-555-0103",
    occupancy: 80,
    type: "evacuation",
    coordinates: { lat: 14.59, lng: 120.975 }
  },
  {
    id: 4,
    name: "Volunteer Hub Central",
    location: "Pasig, Metro Manila",
    position: [14.595, 120.98],
    capacity: 150,
    supplies: ["Medical", "Coordination"],
    contact: "+1-555-0104",
    occupancy: 45,
    type: "volunteer",
    coordinates: { lat: 14.595, lng: 120.98 }
  }
];

export default function VolunteerMap({ onLocationSelect, centers = defaultEvacuationCenters, userLocation }: VolunteerMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Update map center when user location is available
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

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

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'evacuation': return '#f59e0b'; // orange
      case 'urgent': return '#ef4444';     // red
      case 'volunteer': return '#22c55e';  // green
      case 'searched': return '#60a5fa';   // blue
      default: return '#f59e0b';
    }
  };

  const getPriorityBadge = (occupancy: number) => {
    if (occupancy >= 90) return "text-red-400";
    if (occupancy >= 75) return "text-orange-400";
    if (occupancy >= 50) return "text-yellow-400";
    return "text-green-400";
  };

  // Convert centers to the format expected by the map
  const mapCenters = centers.map(center => ({
    ...center,
    position: center.coordinates ? [center.coordinates.lat, center.coordinates.lng] as [number, number] : center.position,
    type: center.type || 'evacuation'
  }));

  // Convert user location to map coordinates
  const userLocationCoords = userLocation ? [userLocation.lat, userLocation.lng] as [number, number] : null;

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
        center={mapCenter}
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

        {/* Fly to user location when available */}
        <FlyToUserLocation userLocation={userLocationCoords} />

        {/* 📍 User Location Marker */}
        {userLocationCoords && (
          <Marker
            position={userLocationCoords}
            icon={createUserLocationMarker()}
          >
            <Popup>
              <div className="text-white w-[200px]">
                <div className="flex items-center mb-2">
                  <Navigation size={16} className="text-blue-400 mr-2" />
                  <h3 className="font-semibold text-blue-400 text-sm">
                    Your Location
                  </h3>
                </div>
                <p className="text-xs text-neutral-400">
                  Lat: {userLocationCoords[0].toFixed(6)}<br />
                  Lng: {userLocationCoords[1].toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

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

        {/* 📍 Evacuation Centers and Volunteer Locations */}
        {mapCenters.map((center) => (
          <Marker
            key={center.id}
            position={center.position}
            icon={createLucideMarker(getMarkerColor(center.type || 'evacuation'))}
            eventHandlers={{
              click: () => {
                onLocationSelect?.(center);
              },
            }}
          >
            <Popup>
              <div className="text-white w-[220px]">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm mb-1">
                    {center.type === 'urgent' ? '🆘 ' : center.type === 'volunteer' ? '💪 ' : '🏠 '}
                    {center.name}
                  </h3>
                  <span className={`text-xs font-medium ${getPriorityBadge(center.occupancy)}`}>
                    {center.occupancy}%
                  </span>
                </div>
                
                <div className="border-t border-neutral-700 my-2"></div>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Location:</span>
                    <span className="text-white text-right">{center.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Capacity:</span>
                    <span className="text-white">{center.capacity} people</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Contact:</span>
                    <span className="text-white">{center.contact}</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-neutral-700">
                  <p className="text-xs text-neutral-400 mb-1">Available Supplies:</p>
                  <div className="flex flex-wrap gap-1">
                    {center.supplies.map((supply, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                      >
                        {supply}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Directions Button */}
                {userLocationCoords && (
                  <div className="mt-3 pt-2 border-t border-neutral-700">
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps/dir/${userLocationCoords[0]},${userLocationCoords[1]}/${center.position[0]},${center.position[1]}`;
                        window.open(url, '_blank');
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 px-3 rounded flex items-center justify-center transition-colors"
                    >
                      <Navigation size={14} className="mr-2" />
                      Get Directions from Your Location
                    </button>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* User Location Status Indicator */}
      <div className="absolute bottom-6 left-6 z-[1000]">
        <div className="bg-black/70 border border-neutral-700 rounded-lg p-3 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${userLocation ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-white text-sm">
              {userLocation ? 'Location: Active' : 'Location: Offline'}
            </span>
          </div>
          {userLocation && (
            <div className="text-xs text-neutral-400 mt-1">
              Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}