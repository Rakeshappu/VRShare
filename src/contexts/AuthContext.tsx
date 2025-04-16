import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { toast } from 'react-hot-toast';
import socketService from '../services/socket.service';

interface AuthContextProps {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signup: (data: any) => Promise<{ success: boolean; error?: string }>;
  validateToken: () => Promise<void>;
  updateUser: (updatedUser: any) => void;
  checkAdminAccess: () => Promise<boolean>;
  verifyOTP: (email: string, otp: string) => Promise<any>;
  clearError: () => void;
  setError: (error: string) => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => ({ success: false, error: 'Not implemented' }),
  logout: () => {},
  signup: async () => ({ success: false, error: 'Not implemented' }),
  validateToken: async () => {},
  updateUser: () => {},
  checkAdminAccess: async () => false,
  verifyOTP: async () => ({}),
  clearError: () => {},
  setError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserFromLocalStorage = () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          // Set initial user state from localStorage
          const userData = JSON.parse(userStr);
          setUser(userData);
          setIsAuthenticated(true);
          
          // Now validate with server
          authService.validateToken()
            .then(validatedUser => {
              if (validatedUser) {
                setUser(validatedUser.user);
                socketService.connect(token);
              } else {
                // If validateToken returns null, clear state
                setUser(null);
                setIsAuthenticated(false);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
              }
            })
            .catch(err => {
              console.error('Token validation error:', err);
              setUser(null);
              setIsAuthenticated(false);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setIsLoading(false);
      }
    };

    loadUserFromLocalStorage();
  }, []);

  const clearError = () => {
    setError(null);
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      if (response && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Determine where to redirect based on role
        let redirectPath = '/';
        if (response.user.role === 'admin') {
          redirectPath = '/admin/dashboard';
        } else if (response.user.role === 'faculty') {
          redirectPath = '/faculty/dashboard';
        } else {
          redirectPath = '/dashboard';
        }
        
        // Connect to socket for real-time updates
        socketService.connect(response.token);
        
        // Use navigate for client-side navigation
        navigate(redirectPath);
        
        return { success: true };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login');
      return { 
        success: false, 
        error: error.message || 'Failed to login'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await authService.signup(data);
      if (response && response.success) {
        toast.success('Signup successful! Please check your email to verify your account.');
        return { success: true };
      } else {
        setError(response.error || 'Signup failed');
        toast.error(response.error || 'Signup failed');
        return { success: false, error: response.error || 'Signup failed' };
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Signup failed');
      toast.error(error.message || 'Signup failed');
      return { success: false, error: error.message || 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    socketService.disconnect();
    navigate('/auth/login');
  };

  const validateToken = async () => {
    try {
      const userData = await authService.validateToken();
      if (userData) {
        setUser(userData.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: any) => {
    setUser(updatedUser);
    authService.updateStoredUserData(updatedUser);
  };
  
  const checkAdminAccess = async () => {
    try {
      return await authService.checkAdminAccess();
    } catch (error) {
      console.error('Admin check failed:', error);
      return false;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      return await authService.verifyOTP(email, otp);
    } catch (error: any) {
      setError(error.message || 'OTP verification failed');
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    signup,
    validateToken,
    updateUser,
    checkAdminAccess,
    verifyOTP,
    clearError,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
