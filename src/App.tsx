
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import PublicRoute from './components/auth/PublicRoute';
import MainLayout from './components/layout/MainLayout';

// Pages
import { HomePage } from './pages/home/HomePage';
import { AuthPage } from './pages/auth/AuthPage';
import Login from './pages/auth/Login';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { AdminApprovalPendingPage } from './pages/auth/AdminApprovalPendingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudyMaterialsPage } from './pages/study/StudyMaterialsPage';
import { SubjectDetailPage } from './pages/study/SubjectDetailPage';
import { PlacementResourcesPage } from './pages/placement/PlacementResourcesPage';
import { ResourcesPage } from './pages/resources/ResourcesPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { StarredPage } from './pages/storage/StarredPage';
import { DownloadsPage } from './pages/storage/DownloadsPage';
import { TrashPage } from './pages/storage/TrashPage';
import { NotificationsPage } from './pages/user/NotificationsPage';
import FacultyUploadPage from './pages/faculty/upload/index';
import AdminUploadPage from './pages/admin/upload/index';
import { UsersManagement } from './pages/admin/UsersManagement';
import { AllResources } from './pages/admin/AllResources';
import { CreateUserPage } from './pages/admin/CreateUserPage';
import { EditUserPage } from './pages/admin/EditUserPage';
import { BulkSemesterUpdate } from './pages/admin/BulkSemesterUpdate';
import { EligibleUSNs } from './pages/admin/EligibleUSNs';
import FacultyTrashPage from './pages/faculty/TrashPage';
import AdminTrashPage from './pages/admin/TrashPage';
import { StudentsPage } from './pages/faculty/StudentsPage';
import { FacultyStarredPage } from './pages/faculty/StarredPage';
import { AnalyticsPage } from './pages/faculty/AnalyticsPage';
import FacultySettingsPage from './pages/faculty/SettingsPage';
import { ContactUs } from './pages/ContactUs';
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { TermsOfService } from './pages/legal/TermsOfService';
import { NotFound } from './pages/NotFound';
import { CompetitiveProgramming } from './pages/competitive/CompetitiveProgramming';
import { StudentCompetitiveProgramming } from './pages/competitive/StudentCompetitiveProgramming';
import ProjectReport from './pages/report/ProjectReport';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/*" element={<PublicRoute><AuthPage /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />
              <Route path="/admin-approval-pending" element={<PublicRoute><AdminApprovalPendingPage /></PublicRoute>} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/report" element={<ProjectReport />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={<PrivateRoute><MainLayout><Dashboard /></MainLayout></PrivateRoute>} />
              <Route path="/student/dashboard" element={<PrivateRoute><MainLayout><StudentDashboard /></MainLayout></PrivateRoute>} />
              <Route path="/faculty/dashboard" element={<PrivateRoute><MainLayout><FacultyDashboard /></MainLayout></PrivateRoute>} />
              <Route path="/admin/dashboard" element={<PrivateRoute><MainLayout><AdminDashboard /></MainLayout></PrivateRoute>} />
              
              {/* Study routes */}
              <Route path="/study" element={<PrivateRoute><MainLayout><StudyMaterialsPage /></MainLayout></PrivateRoute>} />
              <Route path="/study/:subject" element={<PrivateRoute><MainLayout><SubjectDetailPage /></MainLayout></PrivateRoute>} />
              
              {/* Placement routes */}
              <Route path="/placement" element={<PrivateRoute><MainLayout><PlacementResourcesPage /></MainLayout></PrivateRoute>} />
              
              {/* Competitive Programming routes */}
              <Route path="/competitive" element={<PrivateRoute><MainLayout><CompetitiveProgramming /></MainLayout></PrivateRoute>} />
              <Route path="/student/competitive" element={<PrivateRoute><MainLayout><StudentCompetitiveProgramming /></MainLayout></PrivateRoute>} />
              
              {/* Resource routes */}
              <Route path="/resources" element={<PrivateRoute><MainLayout><ResourcesPage /></MainLayout></PrivateRoute>} />
              
              {/* User routes */}
              <Route path="/profile" element={<PrivateRoute><MainLayout><ProfilePage /></MainLayout></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><MainLayout><SettingsPage /></MainLayout></PrivateRoute>} />
              <Route path="/notifications" element={<PrivateRoute><MainLayout><NotificationsPage /></MainLayout></PrivateRoute>} />
              
              {/* Storage routes */}
              <Route path="/starred" element={<PrivateRoute><MainLayout><StarredPage /></MainLayout></PrivateRoute>} />
              <Route path="/downloads" element={<PrivateRoute><MainLayout><DownloadsPage /></MainLayout></PrivateRoute>} />
              <Route path="/trash" element={<PrivateRoute><MainLayout><TrashPage /></MainLayout></PrivateRoute>} />
              
              {/* Faculty routes */}
              <Route path="/faculty/upload" element={<PrivateRoute><MainLayout><FacultyUploadPage /></MainLayout></PrivateRoute>} />
              <Route path="/faculty/trash" element={<PrivateRoute><MainLayout><FacultyTrashPage /></MainLayout></PrivateRoute>} />
              <Route path="/faculty/students" element={<PrivateRoute><MainLayout><StudentsPage /></MainLayout></PrivateRoute>} />
              <Route path="/faculty/starred" element={<PrivateRoute><MainLayout><FacultyStarredPage /></MainLayout></PrivateRoute>} />
              <Route path="/faculty/analytics" element={<PrivateRoute><MainLayout><AnalyticsPage /></MainLayout></PrivateRoute>} />
              <Route path="/faculty/settings" element={<PrivateRoute><MainLayout><FacultySettingsPage /></MainLayout></PrivateRoute>} />
              
              {/* Admin routes */}
              <Route path="/admin/upload" element={<PrivateRoute><MainLayout><AdminUploadPage /></MainLayout></PrivateRoute>} />
              <Route path="/admin/users" element={<PrivateRoute><MainLayout><UsersManagement /></MainLayout></PrivateRoute>} />
              <Route path="/admin/resources" element={<PrivateRoute><MainLayout><AllResources /></MainLayout></PrivateRoute>} />
              <Route path="/admin/create-user" element={<PrivateRoute><MainLayout><CreateUserPage /></MainLayout></PrivateRoute>} />
              <Route path="/admin/edit-user/:userId" element={<PrivateRoute><MainLayout><EditUserPage /></MainLayout></PrivateRoute>} />
              <Route path="/admin/bulk-update" element={<PrivateRoute><MainLayout><BulkSemesterUpdate /></MainLayout></PrivateRoute>} />
              <Route path="/admin/eligible-usns" element={<PrivateRoute><MainLayout><EligibleUSNs /></MainLayout></PrivateRoute>} />
              <Route path="/admin/trash" element={<PrivateRoute><MainLayout><AdminTrashPage /></MainLayout></PrivateRoute>} />
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
