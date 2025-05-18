import api from './api';
import { toast } from 'react-hot-toast';

// Fetch study materials for students based on semester
export const fetchStudyMaterials = async (semesterId?: number | null) => {
  try {
    let endpoint = '/api/resources';
    
    if (semesterId) {
      endpoint += `?semester=${semesterId}`;
    }
    
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching study materials:', error);
    toast.error('Failed to load study materials');
    throw error;
  }
};

// Create a new resource
export const createResource = async (formData: FormData) => {
  try {
    const response = await api.post('/api/resources', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.resource;
  } catch (error) {
    console.error('Error creating resource:', error);
    toast.error('Failed to create resource');
    throw error;
  }
};

// Delete a resource
export const deleteResource = async (resourceId: string) => {
  try {
    const response = await api.delete(`/api/resources/${resourceId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting resource:', error);
    toast.error('Failed to delete resource');
    throw error;
  }
};

/**
 * Check database connection
 * @returns Promise with database status
 */
export const checkDatabaseConnection = async () => {
  try {
    // For development, make a direct call to the database status endpoint
    const baseURL = import.meta.env.MODE === 'development' 
      ? 'http://localhost:3000' 
      : window.location.origin;
      
    const response = await fetch(`${baseURL}/api/db/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Database connection check failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to check database connection:', error);
    // Return a structured error response
    return { 
      connected: false, 
      message: error instanceof Error ? error.message : 'Unknown error', 
      error 
    };
  }
};

// Export a default object with all methods for easier imports
const resourceService = {
  fetchStudyMaterials,
  createResource,
  deleteResource,
  checkDatabaseConnection
};

export default resourceService;
