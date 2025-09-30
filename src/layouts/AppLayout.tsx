import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Button } from '../components/ui/button'
import { AlertTriangle, MapPin, Megaphone, Home, Users } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'

export function AppLayout() {
  const { currentUser, logout } = useAuth()

  const navItemsByRole: Record<string, Array<{ to: string; label: string; icon: JSX.Element }>> = {
    Citizen: [
      { to: '/citizen/dashboard', label: 'Dashboard', icon: <Home size={16} /> },
      { to: '/citizen/request-help', label: 'Request Help', icon: <AlertTriangle size={16} /> },
      { to: '/citizen/centers', label: 'Centers', icon: <MapPin size={16} /> },
    ],
    Organization: [
      { to: '/org/dashboard', label: 'Dashboard', icon: <Home size={16} /> },
      { to: '/org/centers', label: 'Centers', icon: <Users size={16} /> },
      { to: '/org/add-center', label: 'Add Center', icon: <MapPin size={16} /> },
      { to: '/org/announcements', label: 'Announcements', icon: <Megaphone size={16} /> },
    ],
    Volunteer: [
      { to: '/volunteer/dashboard', label: 'Dashboard', icon: <Home size={16} /> },
      { to: '/volunteer/needs', label: 'Active Needs', icon: <AlertTriangle size={16} /> },
      { to: '/volunteer/register', label: 'I can help', icon: <Users size={16} /> },
    ],
  }

  const items = currentUser ? navItemsByRole[currentUser.role] : []

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      <aside className="border-r border-neutral-200 dark:border-neutral-700 p-4">
        <div className="text-xl font-semibold mb-6">DisasterConnect</div>
        <nav className="flex flex-col gap-2">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-2 text-sm shadow-md border border-transparent ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            >
              {it.icon}
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 px-6 py-3">
          <div className="font-medium">{currentUser ? `${currentUser.name} (${currentUser.role})` : 'Guest'}</div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {currentUser && <Button variant="outline" onClick={logout}>Logout</Button>}
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


