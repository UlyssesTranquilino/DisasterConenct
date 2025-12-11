import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { MapPin, Phone, User, Loader2, AlertCircle } from "lucide-react";
// Ensure this path matches where you put the service file
import { evacuationCenterService, type EvacuationCenter } from "../../services/evacuationCenterService";
// Ensure this path matches your VolunteerMap component location
import VolunteerMap from "../../components/VolunteerMap";

export default function CitizenCentersPage() {
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);

  const fetchCenters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await evacuationCenterService.getEvacuationCenters();
      setCenters(data);
    } catch (err) {
      console.error("Error fetching centers:", err);
      setError("Unable to load evacuation centers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  // Map backend data to the format VolunteerMap expects
  const mapLocations = centers.map((c) => ({
    id: c.id ? String(c.id) : Math.random().toString(),
    name: c.name,
    location: c.address,
    position: [c.lat, c.lng] as [number, number],
    capacity: c.capacity,
    occupancy: c.occupied ? Math.round((c.occupied / c.capacity) * 100) : 0,
    supplies: [], // Empty array as default for supplies
    contact: c.contact || "N/A",
    coordinates: { lat: c.lat, lng: c.lng },
    type: "evacuation" as const,
  }));

  const handleCenterClick = (id: string) => {
    setSelectedCenterId(id === selectedCenterId ? null : id);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-neutral-400">Locating safe zones...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4 flex justify-center text-red-500">
          <AlertCircle size={48} />
        </div>
        <h3 className="text-lg font-semibold text-white">Connection Error</h3>
        <p className="text-neutral-400 mb-4">{error}</p>
        <Button onClick={fetchCenters} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_450px] h-[calc(100vh-100px)]">
      {/* Left Column: List of Centers */}
      <div className="flex flex-col space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        <h1 className="text-2xl font-bold text-white mb-2">Evacuation Centers</h1>
        
        {centers.length === 0 && (
          <div className="text-neutral-400 italic">No active evacuation centers found nearby.</div>
        )}

        {centers.map((c) => {
          const occupancyRate = c.occupied ? Math.round((c.occupied / c.capacity) * 100) : 0;
          const isFull = occupancyRate >= 100;
          
          return (
            <Card 
              key={c.id} 
              className={`border-0 bg-white/5 border-l-4 transition-all cursor-pointer hover:bg-white/10 ${
                selectedCenterId === c.id 
                  ? "border-l-blue-500 ring-1 ring-blue-500/50" 
                  : "border-l-transparent hover:border-l-neutral-500"
              }`}
              onClick={() => handleCenterClick(c.id!)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg text-white">{c.name}</CardTitle>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    isFull ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                  }`}>
                    {isFull ? "FULL" : "OPEN"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start text-neutral-300">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 text-blue-400 shrink-0" />
                  <span>{c.address}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-neutral-400">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>{c.head || "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{c.contact || "N/A"}</span>
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Occupancy</span>
                    <span>{c.occupied || 0} / {c.capacity} ({occupancyRate}%)</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        isFull ? "bg-red-500" : occupancyRate > 70 ? "bg-yellow-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Right Column: Map */}
      <div className="h-[400px] lg:h-auto rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900/50 shadow-xl relative">
        <div className="absolute inset-0">
          <VolunteerMap centers={mapLocations} />
        </div>
      </div>
    </div>
  );
}