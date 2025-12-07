// components/VolunteerMap.tsx
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation } from "lucide-react";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Gradient background style for cards
const cardGradientStyle = {
  background: "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

// Custom Lucide Marker Icon
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
    popupAnchor: [0, -55],
  });

// Custom icons
const createCustomIcon = (type: string, isSelected: boolean = false) => {
  const colors: Record<string, string> = {
    'evacuation': '#ef4444',  // red
    'urgent': '#f59e0b',     // amber
    'volunteer': '#3b82f6',  // blue
    'searched': '#10b981',   // emerald
    'default': '#6b7280'     // gray
  };

  const color = colors[type as keyof typeof colors] || colors['default'];
  return createLucideMarker(color);
};

// Define proper interfaces
export interface MapLocation {
  id: string;
  name: string;
  location: string;
  position: [number, number];
  capacity: number;
  supplies: string[];
  contact: string;
  occupancy: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  type?: 'evacuation' | 'urgent' | 'volunteer' | 'searched';
  volunteersNeeded?: number;
  volunteersAssigned?: number;
  urgency?: string;
  description?: string;
}

export interface VolunteerMapProps {
  centers: MapLocation[];
  onLocationSelect?: (location: MapLocation) => void;
  userLocation?: { lat: number; lng: number } | null;
  selectedLocationId?: string | null;
}

// Default center coordinates (Manila, Philippines)
const DEFAULT_CENTER: [number, number] = [14.5995, 120.9842];
const DEFAULT_ZOOM = 11;

// Location marker component
const LocationMarker = ({ 
  location, 
  onSelect, 
  isSelected 
}: { 
  location: MapLocation;
  onSelect: () => void;
  isSelected: boolean;
}) => {
  const markerRef = useRef<L.Marker>(null);
  
  useEffect(() => {
    if (isSelected && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isSelected]);

  const icon = createCustomIcon(location.type || 'volunteer', isSelected);
  
  return (
    <Marker
      ref={markerRef}
      position={location.position}
      icon={icon}
      eventHandlers={{
        click: onSelect,
      }}
    >
      <Popup className="custom-popup">
        <div className="p-2 min-w-[200px] bg-neutral-800 text-white rounded">
          <h3 className="font-bold text-sm text-white mb-1">{location.name}</h3>
          
          <div className="mb-2">
            <p className="text-xs text-gray-300 mb-1">{location.location}</p>
            
            {location.description && (
              <p className="text-xs text-gray-300 mb-2">{location.description.substring(0, 100)}...</p>
            )}
            
            {location.volunteersNeeded !== undefined && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-300">Volunteers:</span>
                <span className="text-xs text-gray-200">
                  {location.volunteersAssigned || 0}/{location.volunteersNeeded}
                </span>
              </div>
            )}
            
            {location.urgency && (
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2"
                style={{
                  backgroundColor: location.urgency === 'High' ? '#7f1d1d' : 
                                 location.urgency === 'Medium' ? '#78350f' : '#064e3b',
                  color: location.urgency === 'High' ? '#fecaca' : 
                         location.urgency === 'Medium' ? '#fcd34d' : '#6ee7b7'
                }}
              >
                {location.urgency} Priority
              </div>
            )}
          </div>
          
          {location.supplies && location.supplies.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-300 mb-1">Supplies:</p>
              <div className="flex flex-wrap gap-1">
                {location.supplies.slice(0, 3).map((supply, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded text-xs border border-blue-800/50"
                  >
                    {supply}
                  </span>
                ))}
                {location.supplies.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{location.supplies.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          {location.contact && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-400">Contact: {location.contact}</p>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

// User location marker
const UserLocationMarker = ({ position }: { position: [number, number] }) => {
  const userIcon = createLucideMarker('#10b981'); // Green color for user location

  return (
    <Marker position={position} icon={userIcon}>
      <Popup className="custom-popup">
        <div className="p-2 bg-neutral-800 text-white rounded">
          <h3 className="font-bold text-sm text-white mb-1">Your Location</h3>
          <p className="text-xs text-gray-300">You are here</p>
        </div>
      </Popup>
    </Marker>
  );
};

// User location setter component
const LocationSetter = ({ onLocationSet }: { onLocationSet: (lat: number, lng: number) => void }) => {
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSet(lat, lng);
      L.popup()
        .setLatLng(e.latlng)
        .setContent(`Selected location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        .openOn(map);
    },
  });
  return null;
};

// Directions line component
const DirectionsLine = ({ 
  from, 
  to 
}: { 
  from: [number, number] | null; 
  to: [number, number] | null 
}) => {
  if (!from || !to) return null;
  
  return (
    <Polyline
      positions={[from, to]}
      pathOptions={{
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10'
      }}
    />
  );
};

const VolunteerMap: React.FC<VolunteerMapProps> = ({
  centers,
  onLocationSelect,
  userLocation,
  selectedLocationId
}) => {
  const mapRef = useRef<L.Map>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(
    userLocation ? [userLocation.lat, userLocation.lng] : null
  );
  const [showDirections, setShowDirections] = useState(false);

  // Update user coordinates when userLocation prop changes
  useEffect(() => {
    if (userLocation) {
      setUserCoords([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  // Center map on selected location
  useEffect(() => {
    if (selectedLocationId && mapRef.current) {
      const location = centers.find(loc => loc.id === selectedLocationId);
      if (location) {
        mapRef.current.flyTo(location.position, 14);
        setSelectedLocation(location);
      }
    }
  }, [selectedLocationId, centers]);

  // Fit bounds to show all markers
  useEffect(() => {
    if (mapRef.current && centers.length > 0) {
      const bounds = L.latLngBounds(centers.map(center => center.position));
      if (userCoords) {
        bounds.extend(userCoords);
      }
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [centers, userCoords]);

  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    
    // Center map on selected location
    if (mapRef.current) {
      mapRef.current.flyTo(location.position, 15);
    }
  };

  const handleSetUserLocation = (lat: number, lng: number) => {
    setUserCoords([lat, lng]);
    setShowDirections(false);
  };

  const handleGetDirections = () => {
    if (selectedLocation && userCoords) {
      setShowDirections(true);
      
      // Create a route line (simplified - in real app, use a routing service)
      if (mapRef.current) {
        const bounds = L.latLngBounds([userCoords, selectedLocation.position]);
        mapRef.current.fitBounds(bounds, { padding: [100, 100] });
      }
    }
  };

  // Get center for map
  const getMapCenter = (): [number, number] => {
    if (centers.length > 0) {
      // Calculate average center of all locations
      const avgLat = centers.reduce((sum, loc) => sum + loc.position[0], 0) / centers.length;
      const avgLng = centers.reduce((sum, loc) => sum + loc.position[1], 0) / centers.length;
      return [avgLat, avgLng];
    }
    return DEFAULT_CENTER;
  };

  // Get appropriate zoom level
  const getZoomLevel = () => {
    if (centers.length === 0) return DEFAULT_ZOOM;
    if (centers.length === 1) return 14;
    return 11;
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        {/* Directions Toggle */}
        {selectedLocation && userCoords && (
          <button
            onClick={handleGetDirections}
            className="bg-white hover:bg-gray-100 text-gray-800 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-colors"
            title="Get directions to selected location"
          >
            <Navigation size={16} />
            Get Directions
          </button>
        )}

        {/* Legend */}
        <div className="bg-white p-3 rounded-lg shadow-lg">
          <h4 className="text-xs font-bold text-gray-800 mb-2">Map Legend</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-700">Evacuation Centers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs text-gray-700">Urgent Needs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-700">Volunteer Assignments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-700">Your Location</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Info Panel */}
      {selectedLocation && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-sm text-gray-800">{selectedLocation.name}</h3>
            {selectedLocation.urgency && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedLocation.urgency === 'High' ? 'bg-red-100 text-red-800' :
                selectedLocation.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {selectedLocation.urgency}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 mb-2">{selectedLocation.location}</p>
          
          {selectedLocation.description && (
            <p className="text-sm text-gray-700 mb-3">{selectedLocation.description}</p>
          )}

          {selectedLocation.volunteersNeeded !== undefined && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Volunteer Status</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min(100, ((selectedLocation.volunteersAssigned || 0) / selectedLocation.volunteersNeeded) * 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {selectedLocation.volunteersAssigned || 0} of {selectedLocation.volunteersNeeded} volunteers assigned
              </p>
            </div>
          )}

          {selectedLocation.supplies && selectedLocation.supplies.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Supplies Available</p>
              <div className="flex flex-wrap gap-1">
                {selectedLocation.supplies.slice(0, 5).map((supply, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {supply}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => window.open(`https://maps.google.com/maps?q=${selectedLocation.position[0]},${selectedLocation.position[1]}`, '_blank')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Navigation size={14} />
              Open in Maps
            </button>
            <button
              onClick={() => setSelectedLocation(null)}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs font-medium text-gray-600">Total Locations</p>
            <p className="text-lg font-bold text-gray-800">{centers.length}</p>
          </div>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="text-center">
            <p className="text-xs font-medium text-gray-600">High Priority</p>
            <p className="text-lg font-bold text-red-600">
              {centers.filter(c => c.urgency === 'High').length}
            </p>
          </div>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="text-center">
            <p className="text-xs font-medium text-gray-600">Volunteers Needed</p>
            <p className="text-lg font-bold text-blue-600">
              {centers.reduce((sum, loc) => sum + (loc.volunteersNeeded || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={getMapCenter()}
        zoom={getZoomLevel()}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        zoomControl={false}
        ref={mapRef}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        />

        {/* Render location markers */}
        {centers.map((center) => (
          <LocationMarker
            key={center.id}
            location={center}
            onSelect={() => handleLocationSelect(center)}
            isSelected={selectedLocation?.id === center.id}
          />
        ))}

        {/* Render user location marker */}
        {userCoords && <UserLocationMarker position={userCoords} />}

        {/* Render directions line */}
        {showDirections && selectedLocation && userCoords && (
          <DirectionsLine from={userCoords} to={selectedLocation.position} />
        )}

        {/* Enable click to set location (optional) */}
        <LocationSetter onLocationSet={handleSetUserLocation} />
      </MapContainer>

      {/* Custom CSS for markers */}
      <style>{`
        .custom-marker {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        .selected-marker {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% {
            transform: scale(1);
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          }
          50% {
            transform: scale(1.1);
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
          }
          100% {
            transform: scale(1);
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          }
        }
        .leaflet-popup-content {
          margin: 0 !important;
          padding: 0 !important;
        }
        .leaflet-popup-content-wrapper {
          padding: 0 !important;
          border-radius: 8px !important;
        }
      `}</style>
    </div>
  );
};

export default VolunteerMap;