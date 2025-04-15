
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create API instance with default config
const api = axios.create({
  baseURL: '/', // Use relative URL for API requests
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for large file uploads
});

// Request interceptor for adding auth token and handling requests
api.interceptors.request.use(
  (config) => {
    // Don't set Content-Type for FormData or file uploads
    if (
      config.data && 
      (config.data instanceof FormData || 
       config.headers['Content-Type'] === 'multipart/form-data')
    ) {
      // Let the browser set the content type and boundaries
      delete config.headers['Content-Type'];
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Log auth header for admin routes to help debug permission issues
      if (config.url?.includes('/admin/')) {
        console.log(`Admin route detected: ${config.url}`);
        console.log(`Setting Authorization header: Bearer ${token.substring(0, 10)}...`);
        
        // Decode JWT token to check role (only for debugging)
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          console.log('Token payload for admin request:', { 
            userId: payload.userId, 
            role: payload.role,
            isAdmin: payload.role === 'admin',
            exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'undefined'
          });
        } catch (e) {
          console.warn('Could not decode token for debugging:', e);
        }
      }
    } else if (config.url?.includes('/admin/')) {
      console.warn('Warning: Attempting to access admin route without token');
    }
    
    // Log request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, 
      config.params || config.data instanceof FormData ? '[FormData]' : config.data || '');
    
    return config;
  }, 
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common responses
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`API Response [${response.status}]:`, response.data);
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      toast.error('Network error. Please check your connection.');
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0,
        data: null
      });
    }
    
    // Log detailed error for debugging
    console.error('API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      message: error.message
    });
    
    // Check if token is expired or invalid - we may need to refresh or logout
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.error || 'Authentication failed';
      console.error('Auth error:', errorMessage);
      
      // Refresh the page to get a new token if needed
      if (errorMessage.includes('expired')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('Token expired, redirecting to login');
        window.location.href = '/auth/login';
        return Promise.reject({
          message: 'Your session has expired. Please log in again.',
          status: error.response.status,
          data: error.response.data
        });
      }
      
      // For now, just remove auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect to login if not already on an auth page
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/auth/')) {
        window.location.href = '/auth/login';
      }
    }
    
    // Special handling for 403 errors in admin section
    if (error.response?.status === 403) {
      if (error.config?.url?.includes('/admin/')) {
        // Log admin permission issues but don't show toast - the code will handle it
        console.warn('Admin permission denied:', error.config?.url);
        
        // Check local storage for user role info
        try {
          const userInfo = localStorage.getItem('user');
          if (userInfo) {
            const user = JSON.parse(userInfo);
            console.log('Current user role in localStorage:', user.role);
            
            if (user.role !== 'admin') {
              console.error('User does not have admin role in localStorage');
              toast.error('You need administrator privileges to access this section');
              
              // Redirect to dashboard based on role
              if (user.role === 'faculty') {
                window.location.href = '/faculty/dashboard';
              } else {
                window.location.href = '/dashboard';
              }
            }
          } else {
            console.warn('No user info in localStorage');
          }
        } catch (e) {
          console.error('Error checking localStorage user info:', e);
        }
      } else {
        toast.error('Access forbidden. Please check your permissions.');
      }
      
      return Promise.reject({
        message: 'You do not have permission to perform this action.',
        status: error.response.status,
        data: error.response.data
      });
    }
    
    // Handle 500 errors more gracefully
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
      
      // For admin dashboard stats, provide fallback
      if (error.config?.url?.includes('/api/user/stats') || 
          error.config?.url?.includes('/api/resources/stats')) {
        console.warn('Using fallback data for stats API');
        return Promise.reject({
          message: 'Error loading analytics. Using fallback data.',
          status: error.response.status,
          data: error.response.data,
          fallback: true
        });
      }
      
      toast.error('Server error. Please try again later.');
    }
    
    // Extract error message from response
    const errorMessage = 
      error.response?.data?.error || 
      error.message || 
      'An error occurred';
    
    // Show error toast for API errors (except auth errors which are handled separately)
    if (error.response?.status !== 401) {
      // Prevent duplicate toasts for analytics errors
      if (!error.config?.url?.includes('/api/user/stats')) {
        toast.error(errorMessage);
      }
    }
    
    // Format error for easier handling in components
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Add request cancellation support
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

// Helper to check if user has admin role
export const hasAdminRole = () => {
  try {
    const userInfo = localStorage.getItem('user');
    if (!userInfo) return false;
    
    const user = JSON.parse(userInfo);
    return user.role === 'admin';
  } catch (e) {
    console.error('Error checking admin role:', e);
    return false;
  }
};

// This method verifies with the server if the user has admin access
export const verifyAdminAccess = async () => {
  try {
    const response = await api.get('/api/auth/admin-check');
    return response.data;
  } catch (error) {
    console.error('Admin access verification failed:', error);
    return { isAdmin: false };
  }
};

export default api;
