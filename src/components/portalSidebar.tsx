import { useState } from "react";
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

export function PortalSidebar() {
  const { currentUser, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      className={`fixed relative border-r border-neutral-200 dark:border-neutral-700 min-h-screen bg-white dark:bg-black/50 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header with toggle button */}
      <div className="flex items-center p-4 border-b border-neutral-200 dark:border-neutral-700 h-16">
        <div
          className={`flex items-center w-full ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && (
            <div className="text-lg whitespace-nowrap">DisasterConnect</div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-10 w-10 p-0 flex-shrink-0 text-gray-400 hover:text-white 
              outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 
              active:outline-none active:ring-0 select-none"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelRight size={12} className="scale-150 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col p-3">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to.startsWith("/") ? it.to : `/${it.to}`}
            end={it.to.includes("dashboard")}
            className={({ isActive }) =>
              `flex items-center rounded-lg px-3 py-3 text-sm transition-colors duration-200 
              outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 
              active:outline-none active:ring-0 select-none
              ${
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
            {!isCollapsed && (
              <span className="ml-3 whitespace-nowrap overflow-hidden">
                {it.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[#10172A] bg-[#03081C]">
        <div className="flex">
          {currentUser && (
            <Button
              variant="ghost"
              onClick={logout}
              className={`flex items-center text-sm transition-colors duration-200 w-full 
              outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 
              active:outline-none active:ring-0 select-none
              ${
                isCollapsed ? "justify-center" : "justify-start"
              } text-neutral-400 hover:text-white hover:bg-[#10172A]`}
              title={isCollapsed ? "Logout" : ""}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <LogOut size={18} />
              </div>
              {!isCollapsed && (
                <span className="ml-3 whitespace-nowrap overflow-hidden">
                  Logout
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
