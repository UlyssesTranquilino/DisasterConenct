// LeafletMapPicker.tsx (A separate file you must create)
import React, { useState, useEffect } from 'react';
// These imports require the 'react-leaflet' and 'leaflet' libraries to be installed
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Define the coordinate interface used across the app
interface MapCoords { lat: number; lng: number }

// Fix for default marker icon issue in Leaflet (Necessary for many environments)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Helper component to handle map clicks and move marker
function LocationMarker({ onMapClick, center }: { onMapClick: (coords: MapCoords) => void; center: MapCoords }) {
    const [position, setPosition] = useState(center);

    const map = useMapEvents({
        click(e) {
            const coords: MapCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
            setPosition(coords);
            onMapClick(coords);
        },
        locationfound(e: any) {
            // Note: 'any' is used here because Leaflet event types can be complex in generic TS
            const coords: MapCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
            map.flyTo(coords, map.getZoom());
        }
    });

    useEffect(() => {
        map.setView(center, map.getZoom());
        setPosition(center);
    }, [center, map]);

    return (
        <Marker position={position} />
    );
}

// Main Map Component
export default function LeafletMapPicker({ center, onLocationSelect }: { center: MapCoords; onLocationSelect: (coords: MapCoords) => void }) {
    // Note: The 'center' prop is guaranteed to be MapCoords in this final structure.
    
    return (
        <MapContainer 
            center={center} 
            zoom={13} 
            scrollWheelZoom={true}
            // CRITICAL: You must define a fixed height for the MapContainer element
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <LocationMarker 
                onMapClick={onLocationSelect} 
                center={center} 
            />
        </MapContainer>
    );
}