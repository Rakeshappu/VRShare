import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { useAuth } from '../../hooks/useAuth';
import DashboardCard from '../../components/dashboard/DashboardCard';
import { Users, FileText, Database, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResources: 0,
    pendingApprovals: 0,
    eligibleUSNs: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // In a real application, fetch these stats from your API
        const response = await api.get('/api/admin/dashboard/stats');
        
        if (response.data) {
          setStats({
            totalUsers: response.data.totalUsers || 0,
            totalResources: response.data.totalResources || 0,
            pendingApprovals: response.data.pendingApprovals || 0,
            eligibleUSNs: response.data.eligibleUSNs || 0
          });
        }
      } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        // Fallback to demo data
        setStats({
          totalUsers: 125,
          totalResources: 430,
          pendingApprovals: 8,
          eligibleUSNs: 350
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <Header pageTitle="Admin Dashboard" />
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, {user?.fullName}</h1>
            <p className="text-gray-600 dark:text-gray-400">Here's what's happening in your institution today.</p>
          </div>
          
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Total Users"
              value={isLoading ? "Loading..." : stats.totalUsers.toString()}
              icon={<Users size={24} />}
              color="blue"
              description="All registered users"
              onClick={() => handleCardClick('/admin/users')}
            />
            
            <DashboardCard
              title="Total Resources"
              value={isLoading ? "Loading..." : stats.totalResources.toString()}
              icon={<FileText size={24} />}
              color="green"
              description="All uploaded resources"
              onClick={() => handleCardClick('/admin/resources')}
            />
            
            <DashboardCard
              title="Pending Approvals"
              value={isLoading ? "Loading..." : stats.pendingApprovals.toString()}
              icon={<Database size={24} />}
              color="yellow"
              description="Users awaiting verification"
              onClick={() => handleCardClick('/admin/users')}
            />
            
            <DashboardCard
              title="Eligible USNs"
              value={isLoading ? "Loading..." : stats.eligibleUSNs.toString()}
              icon={<Award size={24} />}
              color="purple"
              description="USNs in database"
              onClick={() => handleCardClick('/admin/eligible-usns')}
            />
          </div>
          
          {/* Rest of dashboard content */}
          {/* Add more sections as needed */}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
