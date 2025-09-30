import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { mockAnnouncements } from '../../mock/data'

export default function OrgAnnouncementsPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Post announcement', { title, body })
    alert('Announcement posted (mock)!')
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h2 className="text-xl font-semibold mb-4">Post Announcement</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Input id="body" value={body} onChange={(e)=>setBody(e.target.value)} placeholder="Short message" />
          </div>
          <Button type="submit">Post</Button>
        </form>
      </div>
      <div className="grid gap-3">
        {mockAnnouncements.map(a => (
          <Card key={a.id}>
            <CardHeader>
              <CardTitle>{a.title}</CardTitle>
            </CardHeader>
            <CardContent>{a.body}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


