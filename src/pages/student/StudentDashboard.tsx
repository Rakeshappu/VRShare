
import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { useAuth } from '../../hooks/useAuth';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { FolderOpen, BookOpen, Star, FileText } from 'lucide-react';
import api from '../../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalResources: 0,
    recentlyViewed: 0,
    starred: 0,
    downloads: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // In a real application, fetch these stats from your API
        const response = await api.get('/api/user/stats');
        
        if (response.data) {
          setStats({
            totalResources: response.data.totalResources || 0,
            recentlyViewed: response.data.recentlyViewed || 0,
            starred: response.data.starred || 0,
            downloads: response.data.downloads || 0
          });
        }
      } catch (error) {
        console.error('Error fetching student dashboard stats:', error);
        // Fallback to demo data
        setStats({
          totalResources: 240,
          recentlyViewed: 5,
          starred: 12,
          downloads: 28
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <Header pageTitle="Student Dashboard" />
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, {user?.fullName}</h1>
            <p className="text-gray-600 dark:text-gray-400">Here's your learning activity overview.</p>
          </div>
          
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Available Resources"
              value={isLoading ? "Loading..." : stats.totalResources.toString()}
              icon={<FolderOpen size={24} />}
              color="blue"
              description="Total study materials"
            />
            
            <DashboardCard
              title="Recently Viewed"
              value={isLoading ? "Loading..." : stats.recentlyViewed.toString()}
              icon={<BookOpen size={24} />}
              color="green"
              description="Recently accessed materials"
            />
            
            <DashboardCard
              title="Starred Items"
              value={isLoading ? "Loading..." : stats.starred.toString()}
              icon={<Star size={24} />}
              color="yellow"
              description="Your favorite resources"
            />
            
            <DashboardCard
              title="Downloads"
              value={isLoading ? "Loading..." : stats.downloads.toString()}
              icon={<FileText size={24} />}
              color="purple"
              description="Downloaded resources"
            />
          </div>
          
          {/* Additional content can be added here */}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
