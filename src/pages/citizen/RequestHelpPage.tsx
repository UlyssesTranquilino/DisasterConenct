import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'

export default function RequestHelpPage() {
  const [needType, setNeedType] = useState('trapped')
  const [location, setLocation] = useState('')
  const [details, setDetails] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitted help request', { needType, location, details })
    alert('Help request submitted (mock)!')
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-white text-xl font-semibold mb-4">Request Help</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type" className='text-white'>Need Type</Label>
          <Select id="type" value={needType} onChange={(e) => setNeedType(e.target.value)}>
            <option value="trapped">Trapped</option>
            <option value="medical">Medical</option>
            <option value="food">Food</option>
            <option value="rescue">Rescue</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location" className='text-white'>Location</Label>
          <Input id="location" placeholder="Nearest landmark or address" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="details" className='text-white'>Details</Label>
          <Input id="details" placeholder="Any additional info" value={details} onChange={(e) => setDetails(e.target.value)} />
        </div>
        <Button type="submit" className='w-full bg-blue-900 hover:bg-blue-950 text-white'>Submit</Button>
      </form>
    </div>
  )
}


