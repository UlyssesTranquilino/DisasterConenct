import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Button } from "../components/ui/button";
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
} from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { PortalSidebar } from "../components/portalSidebar";

export function AppLayout() {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] text-neutral-900  dark:text-neutral-100">
      <PortalSidebar />

      <div className="flex min-h-screen flex-col">
        {/* <header className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 px-6 py-3">
          <div className="font-medium">
            {currentUser
              ? `${currentUser.name} (${currentUser.role})`
              : "Guest"}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {currentUser && (
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            )}
          </div>
        </header> */}

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
