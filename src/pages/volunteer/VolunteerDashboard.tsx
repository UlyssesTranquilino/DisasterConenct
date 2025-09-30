import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export default function VolunteerDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Volunteer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600">Check active needs and register your availability.</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600">Stay safe. Coordinate with organizations on-site.</div>
        </CardContent>
      </Card>
    </div>
  )
}


