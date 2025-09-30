import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { mockCenters, mockAnnouncements } from '../../mock/data'

export default function OrgDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Managed Centers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600">{mockCenters.length} centers</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm">
            {mockAnnouncements.map(a => <li key={a.id}>{a.title}</li>)}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}


