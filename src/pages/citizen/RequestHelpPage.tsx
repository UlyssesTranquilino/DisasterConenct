import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/components/ui/textarea"; 
import { ArrowLeft, Loader2, AlertTriangle, LocateFixed, Search, MapPin } from "lucide-react"; 
import { citizenService } from "../../services/citizenService";
import { toast } from "sonner";
import LeafletMapPicker from '../../components/LeafletMapPicker';
// Define the coordinate interface used across the app
interface MapCoords { lat: number; lng: number }

// ⭐ IMPORTANT: Replace this placeholder import with your actual Leaflet Map Component import path
// import LeafletMapPicker from './LeafletMapPicker'; 

// --- Component: Map Picker Modal ---
function CitizenMapPicker({ isOpen, onClose, onLocationSelect, initialCoords, currentAddress }: {
    isOpen: boolean;
    onClose: () => void;
    onLocationSelect: (coords: MapCoords, address: string) => void;
    initialCoords: MapCoords | null;
    currentAddress: string;
}) {
    const defaultCenter: MapCoords = useMemo(() => ({ lat: 10.8, lng: 124.7 }), []);
    const [tempCoords, setTempCoords] = useState<MapCoords>(initialCoords || defaultCenter);
    const [tempAddress, setTempAddress] = useState(currentAddress);

    useEffect(() => {
        if (isOpen) {
            setTempCoords(initialCoords || defaultCenter);
            setTempAddress(currentAddress);
        }
    }, [isOpen, initialCoords, currentAddress, defaultCenter]);

    // This callback is passed to the LeafletMapPicker component to update coordinates when the map is clicked
    const handleMapClick = useCallback((coords: MapCoords) => {
        setTempCoords(coords);
        // Simulate reverse geocoding for a user-friendly address display
        setTempAddress(`Selected: Lat ${coords.lat.toFixed(6)}, Lng ${coords.lng.toFixed(6)}`);
    }, []);

    const handleConfirm = () => {
        if (tempCoords.lat === 0 && tempCoords.lng === 0 && tempAddress === "") {
            toast.error('Location Required', { description: 'Please select a location on the map.' });
            return;
        }
        onLocationSelect(tempCoords, tempAddress);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Select Exact Location</h2>
                    <Button onClick={onClose} variant="ghost" className="text-neutral-400 hover:text-white">X</Button>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    
                    {/* Map Integration Point */}
<div className="h-96 w-full rounded-lg relative overflow-hidden border border-neutral-700">
    {/* 🌟 INTEGRATE LEAFLET HERE 🌟 */}
    {/* This entire div is replaced by the component: */}
    <LeafletMapPicker 
        center={tempCoords} 
        onLocationSelect={handleMapClick} 
    />
</div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>Confirmed GPS Coordinates:</Label>
                            <span className="text-sm font-mono text-blue-400">
                                Lat: {tempCoords.lat.toFixed(6)}, Lng: {tempCoords.lng.toFixed(6)}
                            </span>
                        </div>
                        <Input
                            value={tempAddress}
                            onChange={(e) => setTempAddress(e.target.value)}
                            placeholder="Enter description of selected area..."
                            className="bg-neutral-800 border-neutral-700"
                        />
                    </div>
                </div>
                
                <div className="p-4 border-t border-neutral-700">
                    <Button onClick={handleConfirm} className="w-full bg-red-600 hover:bg-red-700">
                        Confirm Location and Close
                    </Button>
                </div>
            </div>
        </div>
    );
}


export default function RequestHelpPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false); 
    const [showMapPicker, setShowMapPicker] = useState(false); 
    
    const [formData, setFormData] = useState({
        type: "medical",
        location: "", // User-input text / confirmed address
        details: "",
    });
    
    const [gpsCoordinates, setGpsCoordinates] = useState<MapCoords | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    // Handler for receiving data from the Map Picker
    const handleLocationSelect = (coords: MapCoords, address: string) => {
        setGpsCoordinates(coords);
        setFormData(prev => ({ ...prev, location: address })); 
        toast.success('Location Updated', { description: 'Map coordinates and address confirmed.' });
    };

    // --- Geolocation Logic ---
    const getUserLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Location Error', { description: 'Geolocation is not supported by your browser' });
            return;
        }

        setIsLocating(true);
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords: MapCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
                setGpsCoordinates(coords);
                setIsLocating(false);
                toast.success('Location Found', { description: `GPS coordinates acquired. Please confirm on map.` });
                
                // Open the map picker to allow visual confirmation/adjustment
                setShowMapPicker(true); 
            },
            (error) => {
                console.error("Error getting location:", error);
                setIsLocating(false);
                toast.warning('Location Warning', { description: 'Could not get precise GPS. Please enter your location manually.' });
                setGpsCoordinates(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 20000, 
                maximumAge: 60000
            }
        );
    };
    
    // Attempt to get location automatically on load
    useEffect(() => {
        getUserLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.location && (!gpsCoordinates || (gpsCoordinates.lat === 0 && gpsCoordinates.lng === 0))) {
            toast.error("Location is required", { description: "Please enter your location and/or confirm coordinates on the map." });
            return;
        }

        setIsSubmitting(true);

        try {
            const finalLocationData = {
                coordinates: gpsCoordinates || { lat: 0, lng: 0 },
                location: formData.location, 
                description: formData.details, 
                
                status: 'Open', 
                volunteersAssigned: 0,
                volunteersNeeded: 1, 
            };
            
            await citizenService.requestHelp({
                type: formData.type,
                disasterId: null, 
                ...finalLocationData
            });

            toast.success("Help Request Sent!", { 
                description: "Responders have been notified of your location." 
            });
            
            navigate("/citizen/dashboard");
            
        } catch (error) {
            console.error(error);
            toast.error("Request Failed", { 
                description: "Could not send help request. Please try again." 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-6">
            <Button 
                variant="ghost" 
                onClick={() => navigate(-1)} 
                className="mb-6 pl-0 hover:pl-2 transition-all"
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
                    <AlertTriangle className="h-8 w-8" />
                    Request Immediate Help
                </h1>
                <p className="text-neutral-400">
                    Fill out this form only in case of emergency. Misuse may delay help for others.
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="type">What kind of help do you need?</Label>
                    <div className="relative">
                        <select
                            id="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="medical">Medical Emergency / Injury</option>
                            <option value="trapped">Trapped / Rescue Needed</option>
                            <option value="food">Food / Water Shortage</option>
                            <option value="evacuation">Evacuation Assistance</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">Exact Location (Address / Landmark)</Label>
                    <div className="flex gap-2">
                        <Input 
                            id="location" 
                            placeholder="e.g. 2nd Floor, 123 Rizal St, Brgy. San Juan" 
                            value={formData.location} 
                            onChange={handleChange}
                            className="bg-neutral-900 border-neutral-700 h-12 flex-1"
                            required
                        />
                        <Button
                            type="button"
                            onClick={getUserLocation}
                            disabled={isLocating || showMapPicker}
                            className="h-12 w-12 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20"
                            title="Get my GPS location and open map"
                        >
                            {isLocating ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <LocateFixed className="h-5 w-5" />
                            )}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setShowMapPicker(true)}
                            className="h-12 w-12 p-0 bg-neutral-600 hover:bg-neutral-700 shadow-lg shadow-neutral-900/20"
                            title="Open Map Picker"
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    </div>
                    <p className="text-xs text-neutral-500">
                        {gpsCoordinates 
                            ? `GPS Acquired: Lat ${gpsCoordinates.lat.toFixed(4)}, Lng ${gpsCoordinates.lng.toFixed(4)}` 
                            : "Click the map pin to get precise GPS coordinates."}
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="details">Additional Details (Optional)</Label>
                    <Textarea 
                        id="details" 
                        placeholder="Describe the situation, number of people, specific needs..." 
                        value={formData.details} 
                        onChange={handleChange}
                        className="bg-neutral-900 border-neutral-700 min-h-[100px]"
                    />
                </div>

                <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Broadcasting Request...
                        </>
                    ) : (
                        "SUBMIT REQUEST"
                    )}
                </Button>
            </form>

            {/* Map Picker Modal Integration */}
            <CitizenMapPicker
                isOpen={showMapPicker}
                onClose={() => setShowMapPicker(false)}
                onLocationSelect={handleLocationSelect}
                initialCoords={gpsCoordinates}
                currentAddress={formData.location}
            />
        </div>
    );
}