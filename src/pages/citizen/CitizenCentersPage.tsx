import { mockCenters } from '../../mock/data'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export default function CitizenCentersPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
      <div className="grid gap-3">
        {mockCenters.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle>{c.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">Location: {c.location}</div>
              <div className="text-sm">Capacity: {c.occupied}/{c.capacity}</div>
              <div className="text-sm">Supplies: {c.supplies.join(', ')}</div>
              <div className="text-sm">Services: {c.services.join(', ')}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full bg-slate-100 grid place-items-center text-slate-500">Map Placeholder</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


