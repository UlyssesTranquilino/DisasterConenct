import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

export default function VolunteerRegisterPage() {
  const [name, setName] = useState('')
  const [skills, setSkills] = useState('')
  const [availability, setAvailability] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Volunteer register', { name, skills: skills.split(',').map(s=>s.trim()), availability })
    alert('Thanks for volunteering (mock)!')
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold mb-4">Register to Help</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e)=>setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="skills">Skills (comma separated)</Label>
          <Input id="skills" value={skills} onChange={(e)=>setSkills(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="availability">Availability</Label>
          <Input id="availability" value={availability} onChange={(e)=>setAvailability(e.target.value)} placeholder="e.g., Weekends, evenings" />
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </div>
  )
}


