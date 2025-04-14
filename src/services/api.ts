
//src\services\api.ts
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
      
      // If token is explicitly reported as expired, try refreshing (not implemented yet)
      if (errorMessage.includes('expired')) {
        // Future enhancement: implement token refresh
        console.warn('Token expired, should implement refresh');
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

export default api;
