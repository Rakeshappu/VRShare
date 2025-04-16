
import api from './api';
import { toast } from 'react-hot-toast';
import { decodeToken } from '../utils/authUtils';

// Auth service object with all auth methods
export const authService = {
  // Login function
  async login(email: string, password: string) {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Return response data for the calling function to handle
        return response.data;
      } else {
        throw new Error('No token received from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Logout function
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    window.location.href = '/auth/login';
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Attempt to decode token to check if it's valid
      const decodedToken = decodeToken(token);
      return !!decodedToken;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  // Get user role from local storage
  getUserRole(): string | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      return user.role;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Determine redirect path based on user role
  getRedirectPathAfterLogin(userRole: string): string {
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'faculty':
        return '/faculty/dashboard';
      case 'student':
        return '/dashboard';
      default:
        return '/';
    }
  },

  // Check if user token is still valid
  async validateToken() {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('Token validation error:', error);
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  },

  // Check if user has admin rights
  async checkAdminAccess() {
    try {
      const response = await api.get('/api/auth/admin-check');
      return response.data.isAdmin;
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    }
  },

  // Update local storage after profile update
  updateStoredUserData(updatedUser: any) {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    try {
      const user = JSON.parse(userStr);
      const newUserData = { ...user, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUserData));
    } catch (error) {
      console.error('Error updating stored user data:', error);
    }
  },

  // OTP verification function
  async verifyOTP(email: string, otp: string) {
    try {
      const response = await api.post('/api/auth/verify-otp', { email, otp });
      if (response.data.success) {
        toast.success('Email verified successfully! Please log in.');
        return response.data;
      } else {
        throw new Error(response.data.message || 'OTP verification failed');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'OTP verification failed';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Resend OTP function
  async resendOTP(email: string) {
    try {
      const response = await api.post('/api/auth/send-otp', { email });
      if (response.data.success) {
        toast.success('OTP resent successfully! Please check your email.');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend OTP';
      toast.error(errorMessage);
      throw error;
    }
  },

  // Signup function
  async signup(data: any) {
    try {
      const response = await api.post('/api/auth/signup', data);
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }
};

// For backwards compatibility
export default authService;
