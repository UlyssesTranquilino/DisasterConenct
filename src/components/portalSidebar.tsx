import { NavLink } from "react-router-dom";
import { useAuth } from "../lib/auth";
import {
  AlertTriangle,
  MapPin,
  Megaphone,
  Home,
  Users,
  LayoutDashboard,
  Building2,
  Package,
  BarChart3,
  LogOut,
  PanelRight,
} from "lucide-react";
import { Button } from "../components/ui/button";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function PortalSidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { currentUser, logout } = useAuth();

  const navItemsByRole: Record<
    string,
    Array<{ to: string; label: string; icon: JSX.Element }>
  > = {
    Citizen: [
      {
        to: "/citizen/dashboard",
        label: "Dashboard",
        icon: <Home size={20} />,
      },
      {
        to: "/citizen/request-help",
        label: "Request Help",
        icon: <AlertTriangle size={20} />,
      },
      { to: "/citizen/centers", label: "Centers", icon: <MapPin size={20} /> },
    ],
    Organization: [
      {
        to: "/org/dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard size={20} />,
      },
      {
        to: "/org/evacuation-centers",
        label: "Evacuation Centers",
        icon: <Building2 size={20} />,
      },
      { to: "/org/resources", label: "Resources", icon: <Package size={20} /> },
      { to: "/org/volunteers", label: "Volunteers", icon: <Users size={20} /> },
      {
        to: "/org/announcements",
        label: "Announcements",
        icon: <Megaphone size={20} />,
      },
      { to: "/org/reports", label: "Reports", icon: <BarChart3 size={20} /> },
    ],
    Volunteer: [
      {
        to: "/volunteer/dashboard",
        label: "Dashboard",
        icon: <Home size={20} />,
      },
      {
        to: "/volunteer/needs",
        label: "Active Needs",
        icon: <AlertTriangle size={20} />,
      },
      {
        to: "/volunteer/register",
        label: "I can help",
        icon: <Users size={20} />,
      },
    ],
  };

  const items = currentUser ? navItemsByRole[currentUser.role] : [];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white dark:bg-black/50 border-r border-neutral-200 dark:border-neutral-700 transition-all duration-300 flex flex-col z-50 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header with toggle */}
      <div className="flex items-center justify-between p-4 h-16">
        {!isCollapsed && <div className="text-lg">DisasterConnect</div>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-10 w-10 p-0 text-gray-400 hover:text-white"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelRight size={12} className="scale-150 text-gray-400" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to.includes("dashboard")}
            className={({ isActive }) =>
              `flex items-center rounded-lg px-3 py-3 mb-1 text-sm transition-colors duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
              }`
            }
            title={isCollapsed ? it.label : ""}
          >
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              {it.icon}
            </div>
            {!isCollapsed && <span className="ml-3">{it.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#10172A] bg-[#03081C]">
        <div className="p-3 flex justify-center">
          {currentUser && (
            <Button
              variant="ghost"
              onClick={logout}
              className={`flex items-center text-sm w-full text-neutral-400 hover:text-white hover:bg-[#10172A] 
        transition-all duration-300
        ${
          isCollapsed
            ? "justify-center w-12 h-10 rounded-full p-0"
            : "justify-start h-12 px-4 rounded-lg"
        }
      `}
              title={isCollapsed ? "Logout" : ""}
            >
              <LogOut size={20} />
              {!isCollapsed && <span className="ml-3">Logout</span>}
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
