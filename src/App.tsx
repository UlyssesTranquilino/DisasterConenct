import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { AppLayout } from "./layouts/AppLayout";
import { Toaster } from "sonner";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import RoleSelectionPage from "./pages/auth/RoleSelectionPage";
import LandingPage from "./pages/LandingPage";

import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import RequestHelpPage from "./pages/citizen/RequestHelpPage";
import CitizenCentersPage from "./pages/citizen/CitizenCentersPage";

import OrgDashboard from "./pages/org/OrgDashboard";
import OrgCentersPage from "./pages/org/OrgCentersPage";
import OrgAddCenterPage from "./pages/org/OrgAddCenterPage";
import OrgAnnouncementsPage from "./pages/org/OrgAnnouncementsPage";
import OrgEvacuationCentersPage from "./pages/org/OrgEvacuationCentersPage";
import OrgReportsPage from "./pages/org/OrgReportsPage";
import OrgVolunteersPage from "./pages/org/OrgVolunteersPage";
import { OrgResourcesPage } from "./pages/org/OrgResourcesPage";

import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import VolunteerNeedsPage from "./pages/volunteer/VolunteerNeedsPage";
import VolunteerRegisterPage from "./pages/volunteer/VolunteerRegisterPage";

// Organization layout
function OrganizationLayout() {
  return <AppLayout />;
}

export default function App() {
  // ----------------- ROLE ROUTE -----------------
  const RoleRoute = ({
    roles,
    children,
  }: {
    roles: Array<"citizen" | "organization" | "volunteer">;
    children: JSX.Element;
  }) => {
    const { currentUser, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#0A0F1C] text-white">
          <div className="text-lg">Loading...</div>
        </div>
      );
    }

    if (!currentUser) return <Navigate to="/login" replace />;

    // Check if user's activeRole is in the allowed roles (case-insensitive)
    if (!currentUser.activeRole) {
      return <Navigate to="/login" replace />;
    }

    const userRole = currentUser.activeRole.toLowerCase();
    const allowedRoles = roles.map((r) => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  // ----------------- PUBLIC ROUTE -----------------
  const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const { currentUser, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#0A0F1C] text-white">
          <div className="text-lg">Loading...</div>
        </div>
      );
    }

    if (currentUser && currentUser.activeRole) {
      if (currentUser.activeRole === "citizen")
        return <Navigate to="/citizen/dashboard" replace />;
      if (currentUser.activeRole === "organization")
        return <Navigate to="/org/dashboard" replace />;
      if (currentUser.activeRole === "volunteer")
        return <Navigate to="/volunteer/dashboard" replace />;
    }

    return children;
  };
  return (
    <AuthProvider>
      <ThemeProvider>
        <OrganizationProvider>
          <Toaster richColors theme="dark" position="top-right" />
          <Routes>
            {/* PUBLIC */}

            <Route path="/" element={<LandingPage />} />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            <Route
              path="/select-role"
              element={
                <PublicRoute>
                  <RoleSelectionPage />
                </PublicRoute>
              }
            />

            {/* APP LAYOUT */}
            <Route element={<OrganizationLayout />}>
              {/* CITIZEN */}
              <Route
                path="/citizen/dashboard"
                element={
                  <RoleRoute roles={["citizen"]}>
                    <CitizenDashboard />
                  </RoleRoute>
                }
              />

              <Route
                path="/citizen/request-help"
                element={
                  <RoleRoute roles={["citizen"]}>
                    <RequestHelpPage />
                  </RoleRoute>
                }
              />

              <Route
                path="/citizen/centers"
                element={
                  <RoleRoute roles={["citizen"]}>
                    <CitizenCentersPage />
                  </RoleRoute>
                }
              />

              {/* ORGANIZATION */}
              <Route
                path="/org/dashboard"
                element={
                  <RoleRoute roles={["organization"]}>
                    <OrgDashboard />
                  </RoleRoute>
                }
              />

              <Route
                path="/org/evacuation-centers"
                element={
                  <RoleRoute roles={["organization"]}>
                    <OrgEvacuationCentersPage />
                  </RoleRoute>
                }
              />

              <Route
                path="/org/centers"
                element={
                  <RoleRoute roles={["organization"]}>
                    <OrgCentersPage />
                  </RoleRoute>
                }
              />

              <Route
                path="/org/centers/add"
                element={
                  <RoleRoute roles={["organization"]}>
                    <OrgAddCenterPage />
                  </RoleRoute>
                }
              />

              <Route
                path="/org/resources"
                element={
                  <RoleRoute roles={["organization"]}>
                    <OrgResourcesPage />
                  </RoleRoute>
                }
              />

              <Route
                path="/org/volunteers"
                element={
                  <RoleRoute roles={["organization"]}>
                    <OrgVolunteersPage />
                  </RoleRoute>
                }
              />

              <Route
                path="/org/announcements"
                element={
                  <RoleRoute roles={["organization"]}>
                    <OrgAnnouncementsPage />
                  </RoleRoute>
                }
              />

              <Route
                path="/org/reports"
                element={
                  <RoleRoute roles={["organization"]}>
                    <OrgReportsPage />
                  </RoleRoute>
                }
              />

              {/* VOLUNTEER */}
              <Route
                path="/volunteer/dashboard"
                element={
                  <RoleRoute roles={["volunteer"]}>
                    <VolunteerDashboard />
                  </RoleRoute>
                }
              />

              <Route
                path="/volunteer/needs"
                element={
                  <RoleRoute roles={["volunteer"]}>
                    <VolunteerNeedsPage />
                  </RoleRoute>
                }
              />

              <Route
                path="/volunteer/register"
                element={
                  <RoleRoute roles={["volunteer"]}>
                    <VolunteerRegisterPage />
                  </RoleRoute>
                }
              />
            </Route>
          </Routes>
        </OrganizationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
