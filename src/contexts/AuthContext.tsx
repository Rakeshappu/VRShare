
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { API_ROUTES } from '../lib/api/routes';
import { User, UserRole } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;
}

interface SignupData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  usn?: string;
  department?: string;
  semester?: number;
  phoneNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Verify token with server
        api.get(API_ROUTES.AUTH.ME)
          .then(response => {
            const serverUserData = response.data.user;
            // Update with latest user data from server
            if (serverUserData) {
              const updatedUser = {
                ...userData,
                role: serverUserData.role || userData.role,
                isVerified: serverUserData.isVerified || userData.isVerified,
              };
              
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setUser(updatedUser);
            }
          })
          .catch(error => {
            console.error('Error verifying token:', error);
            // Token might be invalid, clear storage
            if (error.status === 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post(API_ROUTES.AUTH.LOGIN, { email, password });
      
      const { token, user } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Remove token and user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear user state
      setUser(null);
      
      // Optionally notify the server (if you have a logout endpoint)
      // await api.post(API_ROUTES.AUTH.LOGOUT);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Logout error:', error);
      return Promise.reject(error);
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      const response = await api.post(API_ROUTES.AUTH.SIGNUP, userData);
      
      const { token, user } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
