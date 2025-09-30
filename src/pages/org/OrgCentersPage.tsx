import { mockCenters } from '../../mock/data'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export default function OrgCentersPage() {
  return (
    <div className="grid gap-3">
      {mockCenters.map(c => (
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
  )
}


