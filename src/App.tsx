import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/auth/AuthPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import EditUserPage from './pages/admin/EditUserPage';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import { NotFound } from './pages/NotFound';
import { TermsOfService } from './pages/legal/TermsOfService';
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { ContactUs } from './pages/ContactUs';
import { StudyPage } from './pages/study/StudyPage';
import { PlacementPage } from './pages/placement/PlacementPage';
import { ResourcesPage } from './pages/resources/ResourcesPage';
import { UserProfile } from './pages/user/UserProfile';
import { NotificationsPage } from './pages/user/NotificationsPage';
import { CreateUserPage } from './pages/admin/CreateUserPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth/*" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="*" element={<NotFound />} />

        {/* Common Routes - Accessible to all authenticated users */}
        <Route path="/" element={<PrivateRoute><Navigate to="/dashboard" /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/study/:subject?" element={<PrivateRoute><StudyPage /></PrivateRoute>} />
        <Route path="/placement" element={<PrivateRoute><PlacementPage /></PrivateRoute>} />
        <Route path="/resources/:resourceId?" element={<PrivateRoute><ResourcesPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />

        {/* Faculty Routes */}
        <Route path="/faculty/dashboard" element={
          <PrivateRoute allowedRoles={["faculty", "admin"]}>
            <FacultyDashboard />
          </PrivateRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/users" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <UsersManagement />
          </PrivateRoute>
        } />
        <Route path="/admin/users/create" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <CreateUserPage />
          </PrivateRoute>
        } />

        {/* Add the route for editing users in the admin section: */}
        <Route path="/admin/users/edit/:userId" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <EditUserPage />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
