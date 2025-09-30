import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

export default function OrgAddCenterPage() {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [capacity, setCapacity] = useState<number | ''>('')
  const [supplies, setSupplies] = useState('')
  const [services, setServices] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { name, location, capacity: Number(capacity || 0), supplies: supplies.split(',').map(s=>s.trim()), services: services.split(',').map(s=>s.trim()) }
    console.log('Add center', data)
    alert('Center added (mock)!')
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold mb-4">Add Evacuation Center</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e)=>setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={location} onChange={(e)=>setLocation(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input id="capacity" type="number" value={capacity} onChange={(e)=>setCapacity(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplies">Supplies (comma separated)</Label>
          <Input id="supplies" value={supplies} onChange={(e)=>setSupplies(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="services">Services (comma separated)</Label>
          <Input id="services" value={services} onChange={(e)=>setServices(e.target.value)} />
        </div>
        <Button type="submit">Save</Button>
      </form>
    </div>
  )
}


