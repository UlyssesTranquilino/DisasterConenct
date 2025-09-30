import { mockNeeds } from '../../mock/data'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export default function VolunteerNeedsPage() {
  return (
    <div className="grid gap-3">
      {mockNeeds.map(n => (
        <Card key={n.id}>
          <CardHeader>
            <CardTitle className="capitalize">{n.type}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{n.description}</div>
            <div className="text-xs text-slate-600">Location: {n.location} • Priority: {n.priority}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


