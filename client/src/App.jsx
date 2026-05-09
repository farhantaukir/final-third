import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell.component';
import AdminClubDetailPage from './pages/admin/AdminClubDetail.page';
import AdminClubsPage from './pages/admin/AdminClubs.page';
import AdminDashboardPage from './pages/admin/AdminDashboard.page';
import AdminLoginPage from './pages/admin/AdminLogin.page';
import AdminMatchesPage from './pages/admin/AdminMatches.page';
import AdminStandingsPage from './pages/admin/AdminStandings.page';
import AdminUsersPage from './pages/admin/AdminUsers.page';
import CoachAnalyticsPage from './pages/coach/CoachAnalytics.page';
import CoachCommunicationPage from './pages/coach/CoachCommunication.page';
import CoachDashboardPage from './pages/coach/CoachDashboard.page';
import CoachMatchLineupPage from './pages/coach/CoachMatchLineup.page';
import CoachMatchesHistoryPage from './pages/coach/CoachMatchesHistory.page';
import CoachMatchesUpcomingPage from './pages/coach/CoachMatchesUpcoming.page';
import CoachPlayerProfilePage from './pages/coach/CoachPlayerProfile.page';
import CoachSquadPage from './pages/coach/CoachSquad.page';
import PlayerAnnouncementsPage from './pages/player/PlayerAnnouncements.page';
import PlayerDashboardPage from './pages/player/PlayerDashboard.page';
import PlayerFeedbackPage from './pages/player/PlayerFeedback.page';
import PlayerMatchesHistoryPage from './pages/player/PlayerMatchesHistory.page';
import PlayerMatchesUpcomingPage from './pages/player/PlayerMatchesUpcoming.page';
import PlayerStatsPage from './pages/player/PlayerStats.page';
import EditProfilePage from './pages/EditProfile.page';
import ProfilePage from './pages/Profile.page';
import LoginPage from './pages/public/Login.page';
import RegisterPage from './pages/public/Register.page';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicOnlyRoute from './routes/PublicOnlyRoute';
import RoleRoute from './routes/RoleRoute';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />

          <Route
            path="/admin/dashboard"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/clubs"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminClubsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/clubs/:clubId"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminClubDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/matches"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminMatchesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminUsersPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/standings"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminStandingsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/coach/dashboard"
            element={
              <RoleRoute allowedRoles={['coach']}>
                <CoachDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/coach/matches/upcoming"
            element={
              <RoleRoute allowedRoles={['coach']}>
                <CoachMatchesUpcomingPage />
              </RoleRoute>
            }
          />
          <Route
            path="/coach/matches/history"
            element={
              <RoleRoute allowedRoles={['coach']}>
                <CoachMatchesHistoryPage />
              </RoleRoute>
            }
          />
          <Route
            path="/coach/matches/:matchId/lineup"
            element={
              <RoleRoute allowedRoles={['coach']}>
                <CoachMatchLineupPage />
              </RoleRoute>
            }
          />
          <Route
            path="/coach/analytics"
            element={
              <RoleRoute allowedRoles={['coach']}>
                <CoachAnalyticsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/coach/communication"
            element={
              <RoleRoute allowedRoles={['coach']}>
                <CoachCommunicationPage />
              </RoleRoute>
            }
          />
          <Route
            path="/coach/squad"
            element={
              <RoleRoute allowedRoles={['coach']}>
                <CoachSquadPage />
              </RoleRoute>
            }
          />
          <Route
            path="/coach/squad/player/:playerId"
            element={
              <RoleRoute allowedRoles={['coach']}>
                <CoachPlayerProfilePage />
              </RoleRoute>
            }
          />

          <Route
            path="/player/dashboard"
            element={
              <RoleRoute allowedRoles={['player']}>
                <PlayerDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/player/matches/upcoming"
            element={
              <RoleRoute allowedRoles={['player']}>
                <PlayerMatchesUpcomingPage />
              </RoleRoute>
            }
          />
          <Route
            path="/player/matches/history"
            element={
              <RoleRoute allowedRoles={['player']}>
                <PlayerMatchesHistoryPage />
              </RoleRoute>
            }
          />
          <Route
            path="/player/stats"
            element={
              <RoleRoute allowedRoles={['player']}>
                <PlayerStatsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/player/announcements"
            element={
              <RoleRoute allowedRoles={['player']}>
                <PlayerAnnouncementsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/player/feedback"
            element={
              <RoleRoute allowedRoles={['player']}>
                <PlayerFeedbackPage />
              </RoleRoute>
            }
          />
        </Route>
      </Route>

      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="*" element={<Navigate replace to="/login" />} />
    </Routes>
  );
}
