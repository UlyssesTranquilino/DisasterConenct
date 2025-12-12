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
  type?: "evacuation" | "urgent" | "volunteer" | "searched";
  description?: string;
  urgency?: "Low" | "Medium" | "High";
}