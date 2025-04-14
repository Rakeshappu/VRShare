
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import { toast } from 'react-hot-toast';

interface PrivateRouteProps {
  children: React.ReactNode;
  role?: UserRole;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }

  if (!user) {
    console.log('No authenticated user found, redirecting to login');
    return <Navigate to="/auth/login" />;
  }

  console.log('PrivateRoute - Current user role:', user.role);
  console.log('PrivateRoute - Required role:', role);

  // Admin can access all routes
  if (user.role === 'admin') {
    console.log('User is admin, granting access to route');
    return <>{children}</>;
  }

  // For non-admin users, check role-specific routes
  if (role && user.role !== role) {
    console.log(`Access denied: User is ${user.role} but route requires ${role}`);
    
    // Show toast notification for unauthorized access
    toast.error(`This section requires ${role} access`);
    
    if (user.role === 'faculty') {
      return <Navigate to="/faculty/dashboard" />;
    } else if (user.role === 'student') {
      return <Navigate to="/dashboard" />;
    } else {
      return <Navigate to="/auth/login" />;
    }
  }

  // User has appropriate role, grant access
  console.log('Access granted to route');
  return <>{children}</>;
};

export default PrivateRoute;
