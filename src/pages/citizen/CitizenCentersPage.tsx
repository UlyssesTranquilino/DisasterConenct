import { mockCenters } from '../../mock/data'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const cardGradientStyle = {
  background: "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

export default function CitizenCentersPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_400px]">

      <div>
        <Card className="border-0 h-[450px] flex flex-col" style={cardGradientStyle}>
              <CardHeader className="border-b-0 p-0">
                <CardTitle className="text-white text-sm font-medium p-2">
                  Disaster Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <MapContainer
                center={[14.5995, 120.9842]}
                zoom={11}
                className="h-full w-full"
                > 
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                  />
                </MapContainer>
              </CardContent>
            </Card>
      </div>
      
      <div className="grid gap-3 ">
        {mockCenters.map((c) => (
        <Card 
          key={c.id} 
          className="border-0 bg-transparent shadow-none" // remove borders and shadows
          style={cardGradientStyle}
          >
          <CardHeader className="border-0 p-2">
            <CardTitle className="border-0 text-white text-sm font-medium">{c.name}</CardTitle>
          </CardHeader>

          <CardContent className="border-0 p-2">
            <div className="text-white text-sm">Location: {c.location}</div>
            <div className="text-white text-sm">Capacity: {c.occupied}/{c.capacity}</div>
            <div className="text-white text-sm">Supplies: {c.supplies.join(', ')}</div>
            <div className="text-white text-sm">Services: {c.services.join(', ')}</div>
          </CardContent>
        </Card>
        ))}
    </div>

      
    </div>
  )
}


