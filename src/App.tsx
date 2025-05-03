import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/auth/AuthPage';
import { HomePage } from './pages/home/HomePage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import { Toaster } from 'react-hot-toast';
import CompetitiveProgramming from './pages/competitive/CompetitiveProgramming';
import { PlacementResourcesPage } from './pages/placement/PlacementResourcesPage';
import { DownloadsPage } from './pages/storage/DownloadsPage';
import { TrashPage } from './pages/storage/TrashPage';
import { StarredPage } from './pages/storage/StarredPage';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import AnalyticsPage from './pages/faculty/AnalyticsPage';
import { StudentsPage } from './pages/faculty/StudentsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import AllResources from './pages/admin/AllResources';
import { EligibleUSNs } from './pages/admin/EligibleUSNs';
import { StudyMaterialsPage } from './pages/study/StudyMaterialsPage';
import { SubjectDetailPage } from './pages/study/SubjectDetailPage';
import StudentDashboard from './pages/student/StudentDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentCompetitiveProgramming } from './pages/study/StudentCompetitiveProgramming';
import { AdminApprovalPendingPage } from './pages/auth/AdminApprovalPendingPage';
import { default as FacultyUpload } from './pages/faculty/upload';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/*" element={<AuthPage />} />
            <Route path="/admin-approval-pending" element={<AdminApprovalPendingPage />} />

            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <UsersManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/resources"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AllResources />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/eligible-usns"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <EligibleUSNs />
                </PrivateRoute>
              }
            />
            
            {/* Faculty routes */}
            <Route
              path="/faculty/dashboard"
              element={
                <PrivateRoute allowedRoles={['faculty']}>
                  <FacultyDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/analytics"
              element={
                <PrivateRoute allowedRoles={['faculty']}>
                  <AnalyticsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/students"
              element={
                <PrivateRoute allowedRoles={['faculty']}>
                  <StudentsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/trash"
              element={
                <PrivateRoute allowedRoles={['faculty']}>
                  <TrashPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/upload"
              element={
                <PrivateRoute allowedRoles={['faculty']}>
                  <Navigate to="/faculty/upload/select" replace />
                </PrivateRoute>
              }
            />
            <Route
              path="/faculty/upload/*"
              element={
                <PrivateRoute allowedRoles={['faculty']}>
                  <FacultyUpload />
                </PrivateRoute>
              }
            />

            {/* Student routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/study-materials"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <StudyMaterialsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/study-materials/:subjectId"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <SubjectDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/competitive-programming"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <StudentCompetitiveProgramming />
                </PrivateRoute>
              }
            />

            {/* Common routes for both student and faculty */}
            <Route
              path="/placement"
              element={
                <PrivateRoute allowedRoles={['student', 'faculty']}>
                  <PlacementResourcesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/downloads"
              element={
                <PrivateRoute allowedRoles={['student', 'faculty']}>
                  <DownloadsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/starred"
              element={
                <PrivateRoute allowedRoles={['student', 'faculty']}>
                  <StarredPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/trash"
              element={
                <PrivateRoute allowedRoles={['student', 'faculty']}>
                  <TrashPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/competitive"
              element={
                <PrivateRoute allowedRoles={['student', 'faculty']}>
                  <CompetitiveProgramming />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute allowedRoles={['student', 'faculty', 'admin']}>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute allowedRoles={['student', 'faculty', 'admin']}>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
