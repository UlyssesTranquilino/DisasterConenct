import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { PortalSidebar } from "../components/portalSidebar";

export function AppLayout() {
  const { currentUser, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false); // 🔹 shared state

  return (
    <div className="flex min-h-screen text-neutral-900 dark:text-neutral-100">
      {/* Sidebar */}
      <PortalSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content that shifts with sidebar */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300`}
        style={{
          marginLeft: isCollapsed ? "4rem" : "16rem", // 🔹 matches sidebar width (w-16 / w-64)
        }}
      >
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
