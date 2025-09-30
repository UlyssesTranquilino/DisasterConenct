import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { useAuth, type UserRole } from '../../lib/auth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<UserRole>('Citizen')
  const [name, setName] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login submit', { role, name })
    login(role, name || 'Guest')
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Welcome to DisasterConnect</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="Citizen">Citizen</option>
              <option value="Organization">Organization</option>
              <option value="Volunteer">Volunteer</option>
            </Select>
          </div>
          <Button type="submit" className="w-full">Login</Button>
        </form>
        <div className="mt-4 text-sm text-slate-600">
          No account? <Link to="/register" className="underline">Register</Link>
        </div>
      </div>
    </div>
  )
}


