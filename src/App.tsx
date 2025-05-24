
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthPage from './pages/auth/AuthPage';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import { MainLayout } from './components/layout/MainLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudyMaterialsPage from './pages/study/StudyMaterialsPage';
import PlacementResourcesPage from './pages/placement/PlacementResourcesPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import NotificationsPage from './pages/user/NotificationsPage';
import HomePage from './pages/home/HomePage';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/*" element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              } />
              
              {/* Private Routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <MainLayout>
                    <StudentDashboard />
                  </MainLayout>
                </PrivateRoute>
              } />
              
              <Route path="/faculty/dashboard" element={
                <PrivateRoute>
                  <MainLayout>
                    <FacultyDashboard />
                  </MainLayout>
                </PrivateRoute>
              } />
              
              <Route path="/admin/dashboard" element={
                <PrivateRoute>
                  <MainLayout>
                    <AdminDashboard />
                  </MainLayout>
                </PrivateRoute>
              } />
              
              <Route path="/study-materials" element={
                <PrivateRoute>
                  <MainLayout>
                    <StudyMaterialsPage />
                  </MainLayout>
                </PrivateRoute>
              } />
              
              <Route path="/placement-resources" element={
                <PrivateRoute>
                  <MainLayout>
                    <PlacementResourcesPage />
                  </MainLayout>
                </PrivateRoute>
              } />
              
              <Route path="/profile" element={
                <PrivateRoute>
                  <MainLayout>
                    <ProfilePage />
                  </MainLayout>
                </PrivateRoute>
              } />
              
              <Route path="/settings" element={
                <PrivateRoute>
                  <MainLayout>
                    <SettingsPage />
                  </MainLayout>
                </PrivateRoute>
              } />
              
              <Route path="/notifications" element={
                <PrivateRoute>
                  <MainLayout>
                    <NotificationsPage />
                  </MainLayout>
                </PrivateRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
