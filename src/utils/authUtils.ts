
import { toast } from 'react-hot-toast';
import api from '../services/api';

// Function to decode JWT token and extract payload
export const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return payload;
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
};

// Function to check if token contains role information
export const tokenHasRole = (token: string): boolean => {
  const payload = decodeToken(token);
  return payload && typeof payload.role === 'string';
};

// Function to check if local user data and token match in terms of role
export const validateUserRoleWithToken = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      return false;
    }
    
    const userData = JSON.parse(userStr);
    const tokenPayload = decodeToken(token);
    
    // If token doesn't have role property but user data does
    if (tokenPayload && !tokenPayload.role && userData.role) {
      console.warn('Token missing role information. Consider re-login.');
      
      // Verify with server
      try {
        const response = await api.get('/api/auth/debug-token');
        console.log('Debug token response:', response.data);
        
        // If server also confirms role mismatch
        if (response.data.role !== userData.role) {
          toast.error('Your session information is inconsistent. Please log out and log in again.');
          return false;
        }
      } catch (error) {
        console.error('Failed to verify token with server:', error);
      }
    }
    
    // Check for mismatch between stored user role and token role
    if (tokenPayload && tokenPayload.role && userData.role && tokenPayload.role !== userData.role) {
      console.warn('Token role and user role mismatch:', tokenPayload.role, userData.role);
      toast.error('Please log out and log in again to refresh your permissions.');
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Error validating user role with token:', e);
    return false;
  }
};

// Function to force re-login if issues detected
export const forceReloginIfNeeded = async () => {
  const isValid = await validateUserRoleWithToken();
  if (!isValid) {
    toast.error('Please log out and log back in to refresh your session.');
    // Consider adding a logout function here if persistence is an issue
  }
  return isValid;
};
