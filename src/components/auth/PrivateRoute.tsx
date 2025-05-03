
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AnimatedLogo } from '../common/AnimatedLogo';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { API_ROUTES } from '../../lib/api/routes';
import { forceReloginIfNeeded } from '../../utils/authUtils';
import { UserRole } from '../../types/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedLogo />
      </div>
    );
  }

  React.useEffect(() => {
    if (!loading && user && allowedRoles.includes('admin') && user.role === 'admin') {
      api.get(API_ROUTES.AUTH.ADMIN_CHECK)
        .then(response => {
          console.log('Admin verification successful:', response.data);
          if (response.data.needsRelogin) {
            toast.error('Your admin session is incomplete. Please log out and log back in.');
          }
        })
        .catch(error => {
          console.error('Admin verification failed:', error);
          if (error.status === 403) {
            toast.error('Admin privileges could not be verified. Please try logging out and back in.');
            forceReloginIfNeeded();
          }
        });
    }
  }, [user, loading, allowedRoles]);

  console.log('PrivateRoute - Authentication check:', { 
    isLoading: loading, 
    userExists: !!user, 
    userRole: user?.role, 
    requiredRoles: allowedRoles 
  });

  if (!user) {
    console.log('No authenticated user found, redirecting to login');
    return <Navigate to="/auth/login" />;
  }

  console.log('PrivateRoute - Current user role:', user.role);
  console.log('PrivateRoute - Required roles:', allowedRoles);

  if (user.role === 'admin') {
    console.log('User is admin, granting access to route');
    return <>{children}</>;
  }

  if (!allowedRoles.includes(user.role)) {
    console.log(`Access denied: User is ${user.role} but route requires one of ${allowedRoles.join(', ')}`);
    
    toast.error(`This section requires ${allowedRoles.join(' or ')} access`);
    
    if (user.role === 'faculty') {
      return <Navigate to="/faculty/dashboard" />;
    } else if (user.role === 'student') {
      return <Navigate to="/dashboard" />;
    } else {
      return <Navigate to="/auth/login" />;
    }
  }

  console.log('Access granted to route');
  return <>{children}</>;
};

export default PrivateRoute;
