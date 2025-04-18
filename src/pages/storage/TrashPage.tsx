
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Trash, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TrashedItem {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  deleteDate: string;
  resourceId?: string;
}

export const TrashPage = () => {
  const { user } = useAuth();
  const [trashedItems, setTrashedItems] = useState<TrashedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchTrashedItems();
  }, []);
  
  const fetchTrashedItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real application, this would be an API call
      // Simulate API call with timeout
      setTimeout(() => {
        // This is mock data - in a real app, you'd fetch from your backend
        const mockTrashedItems = [
          { 
            id: '1', 
            name: 'Old Lecture Notes.pdf', 
            type: 'PDF', 
            size: '1.5 MB', 
            date: '2023-10-10', 
            deleteDate: '2023-11-10',
            resourceId: 'res1'
          },
          { 
            id: '2', 
            name: 'Draft Assignment.docx', 
            type: 'Word', 
            size: '0.9 MB', 
            date: '2023-10-05', 
            deleteDate: '2023-11-05',
            resourceId: 'res2'
          },
          { 
            id: '3', 
            name: 'Backup Files.zip', 
            type: 'Archive', 
            size: '7.2 MB', 
            date: '2023-09-30', 
            deleteDate: '2023-10-30',
            resourceId: 'res3'
          },
          { 
            id: '4', 
            name: 'Presentation Draft.pptx', 
            type: 'PowerPoint', 
            size: '4.3 MB', 
            date: '2023-09-25', 
            deleteDate: '2023-10-25',
            resourceId: 'res4'
          },
        ];
        
        setTrashedItems(mockTrashedItems);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching trashed items:', error);
      setError('Failed to fetch trashed items');
      setIsLoading(false);
      setTrashedItems([]);
    }
  };

  const restoreItem = async (id: string) => {
    try {
      // In a real app, this would be an API call to restore the item
      // For now, we'll just simulate it with a state update
      toast.promise(
        new Promise((resolve) => {
          setTimeout(() => {
            setTrashedItems(trashedItems.filter(item => item.id !== id));
            resolve('success');
          }, 500);
        }),
        {
          loading: 'Restoring item...',
          success: 'Item restored successfully',
          error: 'Failed to restore item'
        }
      );
    } catch (error) {
      console.error('Error restoring item:', error);
      toast.error('Failed to restore item');
    }
  };

  const deleteItemPermanently = async (id: string) => {
    try {
      // In a real app, this would be an API call to permanently delete the item
      toast.promise(
        new Promise((resolve) => {
          setTimeout(() => {
            setTrashedItems(trashedItems.filter(item => item.id !== id));
            resolve('success');
          }, 500);
        }),
        {
          loading: 'Deleting item permanently...',
          success: 'Item permanently deleted',
          error: 'Failed to delete item'
        }
      );
    } catch (error) {
      console.error('Error deleting item permanently:', error);
      toast.error('Failed to delete item permanently');
    }
  };

  const emptyTrash = async () => {
    try {
      // In a real app, this would be an API call to empty the trash
      toast.promise(
        new Promise((resolve) => {
          setTimeout(() => {
            setTrashedItems([]);
            resolve('success');
          }, 800);
        }),
        {
          loading: 'Emptying trash...',
          success: 'Trash emptied successfully',
          error: 'Failed to empty trash'
        }
      );
    } catch (error) {
      console.error('Error emptying trash:', error);
      toast.error('Failed to empty trash');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <Trash className="mr-2 text-red-500" size={24} />
          Trash
        </h1>
        <button 
          onClick={emptyTrash}
          disabled={trashedItems.length === 0 || isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Empty Trash
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      ) : trashedItems.length === 0 ? (
        <div className="text-center py-10">
          <Trash className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Trash is empty</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            There are no items in your trash.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {trashedItems.map((item) => (
              <li key={item.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{item.name}</p>
                      <p className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>{item.type}</span>
                        <span className="mx-1">•</span>
                        <span>{item.size}</span>
                        <span className="mx-1">•</span>
                        <span>Deleted on {item.date}</span>
                      </p>
                      <p className="text-xs text-red-500">
                        Will be deleted permanently on {item.deleteDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => restoreItem(item.id)}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                      title="Restore"
                    >
                      <RefreshCw size={18} />
                    </button>
                    <button 
                      onClick={() => deleteItemPermanently(item.id)}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete permanently"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TrashPage;
