import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
import { AppLayout } from "./layouts/AppLayout";
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
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import VolunteerNeedsPage from "./pages/volunteer/VolunteerNeedsPage";
import VolunteerRegisterPage from "./pages/volunteer/VolunteerRegisterPage";

import OrgEvacuationCentersPage from "./pages/org/OrgEvacuationCentersPage";
import { OrgReportsPage } from "./pages/org/OrgReportsPage";
import { OrgVolunteersPage } from "./pages/org/OrgVolunteersPage";
import { OrgResourcesPage } from "./pages/org/OrgResourcesPage";

function RoleRoute({
  roles,
  children,
}: {
  roles: Array<"Citizen" | "Organization" | "Volunteer">;
  children: JSX.Element;
}) {
  const { currentUser, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0F1C] text-white">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  console.log(currentUser);
  // if (!currentUser) return <Navigate to="/login" replace />;
  // if (!roles.includes(currentUser.role))
  //   return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0F1C] text-white">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If user is logged in, redirect to their dashboard
  if (currentUser) {
    if (currentUser.role === "Citizen")
      return <Navigate to="/citizen/dashboard" replace />;
    if (currentUser.role === "Organization")
      return <Navigate to="/org/dashboard" replace />;
    if (currentUser.role === "Volunteer")
      return <Navigate to="/volunteer/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
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

          <Route element={<AppLayout />}>
            {/* Citizen */}
            <Route
              path="/citizen/dashboard"
              element={
                <RoleRoute roles={["Citizen"]}>
                  <CitizenDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/citizen/request-help"
              element={
                <RoleRoute roles={["Citizen"]}>
                  <RequestHelpPage />
                </RoleRoute>
              }
            />
            <Route
              path="/citizen/centers"
              element={
                <RoleRoute roles={["Citizen"]}>
                  <CitizenCentersPage />
                </RoleRoute>
              }
            />

            {/* Organization */}
            <Route
              path="/org/dashboard"
              element={
                <RoleRoute roles={["Organization"]}>
                  <OrgDashboard />
                </RoleRoute>
              }
            />

            <Route
              path="/org/evacuation-centers"
              element={
                <RoleRoute roles={["Organization"]}>
                  <OrgEvacuationCentersPage />
                </RoleRoute>
              }
            />

            <Route
              path="/org/resources"
              element={
                <RoleRoute roles={["Organization"]}>
                  <OrgResourcesPage />
                </RoleRoute>
              }
            />

            <Route
              path="/org/volunteers"
              element={
                <RoleRoute roles={["Organization"]}>
                  <OrgVolunteersPage />
                </RoleRoute>
              }
            />

            <Route
              path="/org/announcements"
              element={
                <RoleRoute roles={["Organization"]}>
                  <OrgAnnouncementsPage />
                </RoleRoute>
              }
            />

            <Route
              path="/org/reports"
              element={
                <RoleRoute roles={["Organization"]}>
                  <OrgReportsPage />
                </RoleRoute>
              }
            />

            {/* Volunteer */}
            <Route
              path="/volunteer/dashboard"
              element={
                <RoleRoute roles={["Volunteer"]}>
                  <VolunteerDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/volunteer/needs"
              element={
                <RoleRoute roles={["Volunteer"]}>
                  <VolunteerNeedsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/volunteer/register"
              element={
                <RoleRoute roles={["Volunteer"]}>
                  <VolunteerRegisterPage />
                </RoleRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
