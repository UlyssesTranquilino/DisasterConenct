import { Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { ThemeProvider } from './lib/theme'
import { AppLayout } from './layouts/AppLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import LandingPage from './pages/LandingPage'
import CitizenDashboard from './pages/citizen/CitizenDashboard'
import RequestHelpPage from './pages/citizen/RequestHelpPage'
import CitizenCentersPage from './pages/citizen/CitizenCentersPage'
import OrgDashboard from './pages/org/OrgDashboard'
import OrgCentersPage from './pages/org/OrgCentersPage'
import OrgAddCenterPage from './pages/org/OrgAddCenterPage'
import OrgAnnouncementsPage from './pages/org/OrgAnnouncementsPage'
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard'
import VolunteerNeedsPage from './pages/volunteer/VolunteerNeedsPage'
import VolunteerRegisterPage from './pages/volunteer/VolunteerRegisterPage'

function RoleRoute({ roles, children }: { roles: Array<'Citizen'|'Organization'|'Volunteer'>, children: JSX.Element }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  if (!roles.includes(currentUser.role)) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<AppLayout />}> 
            {/* Citizen */}
            <Route path="/citizen/dashboard" element={<RoleRoute roles={["Citizen"]}><CitizenDashboard /></RoleRoute>} />
            <Route path="/citizen/request-help" element={<RoleRoute roles={["Citizen"]}><RequestHelpPage /></RoleRoute>} />
            <Route path="/citizen/centers" element={<RoleRoute roles={["Citizen"]}><CitizenCentersPage /></RoleRoute>} />

            {/* Organization */}
            <Route path="/org/dashboard" element={<RoleRoute roles={["Organization"]}><OrgDashboard /></RoleRoute>} />
            <Route path="/org/centers" element={<RoleRoute roles={["Organization"]}><OrgCentersPage /></RoleRoute>} />
            <Route path="/org/add-center" element={<RoleRoute roles={["Organization"]}><OrgAddCenterPage /></RoleRoute>} />
            <Route path="/org/announcements" element={<RoleRoute roles={["Organization"]}><OrgAnnouncementsPage /></RoleRoute>} />

            {/* Volunteer */}
            <Route path="/volunteer/dashboard" element={<RoleRoute roles={["Volunteer"]}><VolunteerDashboard /></RoleRoute>} />
            <Route path="/volunteer/needs" element={<RoleRoute roles={["Volunteer"]}><VolunteerNeedsPage /></RoleRoute>} />
            <Route path="/volunteer/register" element={<RoleRoute roles={["Volunteer"]}><VolunteerRegisterPage /></RoleRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}


