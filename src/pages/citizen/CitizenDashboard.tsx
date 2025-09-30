import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CitizenDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600">No active requests. Stay safe and monitor announcements.</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Need Assistance?</CardTitle>
        </CardHeader>
        <CardContent>
          <Link to="/citizen/request-help"><Button><AlertTriangle size={16} /> Request Help</Button></Link>
        </CardContent>
      </Card>
    </div>
  )
}


