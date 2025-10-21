import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapLocation {
  id: number;
  name: string;
  position: [number, number];
  capacity: number;
  supplies: string[];
  contact: string;
  occupancy: number;
}

interface VolunteerMapProps {
  onLocationSelect?: (location: MapLocation) => void;
}

const defaultCenter: [number, number] = [51.505, -0.09];

const evacuationCenters: MapLocation[] = [
  {
    id: 1,
    name: "Central Evacuation Center",
    position: [51.505, -0.09],
    capacity: 500,
    supplies: ["Food", "Water", "Medical", "Blankets"],
    contact: "+1-555-0101",
    occupancy: 68
  },
  {
    id: 2,
    name: "Northside Shelter",
    position: [51.51, -0.1],
    capacity: 300,
    supplies: ["Food", "Water", "Clothing"],
    contact: "+1-555-0102",
    occupancy: 45
  },
  {
    id: 3,
    name: "Community Hall",
    position: [51.50, -0.12],
    capacity: 200,
    supplies: ["Food", "Medical"],
    contact: "+1-555-0103",
    occupancy: 80
  }
];

export default function VolunteerMap({ onLocationSelect }: VolunteerMapProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full w-full">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
        scrollWheelZoom={true} // Changed to true for scroll wheel zoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {evacuationCenters.map((center) => (
          <Marker
            key={center.id}
            position={center.position}
            eventHandlers={{
              click: () => {
                onLocationSelect?.(center);
              },
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-sm text-gray-900">{center.name}</h3>
                <p className="text-xs text-gray-700 mt-1"> {/* Changed from gray-600 to gray-700 for better visibility */}
                  <strong>Capacity:</strong> {center.capacity}<br />
                  <strong>Occupancy:</strong> {center.occupancy}%<br />
                  <strong>Contact:</strong> {center.contact}
                </p>
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-900">Available Supplies:</p>
                  <ul className="text-xs text-gray-700 space-y-1 mt-1"> {/* Changed from gray-600 to gray-700 */}
                    {center.supplies.map((supply, index) => (
                      <li key={index}>• {supply}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}