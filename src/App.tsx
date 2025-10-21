import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
import { AppLayout } from "./layouts/AppLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
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

// --- Role-based route wrapper ---
function RoleRoute({
  roles,
  children,
}: {
  roles: Array<"Citizen" | "Organization" | "Volunteer">;
  children: JSX.Element;
}) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!roles.includes(currentUser.role)) return <Navigate to="/login" replace />;
  return children;
}

// --- Public route wrapper (NEW) ---
function PublicRoute({ children }: { children: JSX.Element }) {
  const { currentUser } = useAuth();

  // Redirect logged-in users away from login/register
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

// --- Main App Component ---
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
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

          {/* Volunteer routes (no role check while testing) */}
          <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
          <Route path="/volunteer/needs" element={<VolunteerNeedsPage />} />
          <Route path="/volunteer/register" element={<VolunteerRegisterPage />} />

          {/* Protected routes using AppLayout */}
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
              path="/org/centers"
              element={
                <RoleRoute roles={["Organization"]}>
                  <OrgCentersPage />
                </RoleRoute>
              }
            />
            <Route
              path="/org/add-center"
              element={
                <RoleRoute roles={["Organization"]}>
                  <OrgAddCenterPage />
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
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
