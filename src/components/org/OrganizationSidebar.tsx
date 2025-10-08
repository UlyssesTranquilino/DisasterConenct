import { NavLink } from 'react-router-dom'
import { Button } from '../ui/button'
import { ThemeToggle } from '../ThemeToggle'
import {
  Home,
  Users,
  MapPin,
  Megaphone,
  Menu,
  LogOut,
} from 'lucide-react'

interface OrganizationSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onLogout: () => void
  currentUser: {
    name: string
    role: string
  }
}

export function OrganizationSidebar({
  collapsed,
  onToggleCollapse,
  onLogout,
  currentUser,
}: OrganizationSidebarProps) {
  const navItems = [
    { to: '/org/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { to: '/org/centers', label: 'Centers', icon: <Users size={18} /> },
    { to: '/org/add-center', label: 'Add Center', icon: <MapPin size={18} /> },
    { to: '/org/announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
  ]

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-gradient-to-b from-[#0A1224] to-[#0E1B38] border-r border-white/10 transition-all duration-300 flex flex-col justify-between`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <h1 className="text-lg font-semibold tracking-wide">
            DisasterConnect
          </h1>
        )}
        <button
          onClick={onToggleCollapse}
          className="text-white/70 hover:text-white transition"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2 mx-2 text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-[#00C2A8] text-black font-medium'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4 text-xs text-white/50 flex flex-col gap-2">
        {!collapsed && (
          <>
            <div className="flex justify-between items-center">
              <ThemeToggle />
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 p-2"
                onClick={onLogout}
              >
                <LogOut size={16} className="mr-1" />
                Logout
              </Button>
            </div>
            <p className="mt-2">© 2025 DisasterConnect</p>
          </>
        )}
      </div>
    </aside>
  )
}
