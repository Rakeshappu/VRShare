import { useState, useEffect } from 'react';
import { BarChart2, Users, BookOpen, Download, Globe, X } from 'lucide-react';
import { SearchBar } from '../search/SearchBar';
import { UserBanner } from '../user/UserBanner';
import { AnalyticsCard } from '../analytics/AnalyticsCard';
import { SemesterResources } from '../resources/SemesterResources';
import { QuickAccess } from '../resources/QuickAccess';
import { ActivityFeed } from '../activities/ActivityFeed';
import { useAuth } from '../../contexts/AuthContext';
import { getResources, checkDatabaseConnection } from '../../services/resource.service';
import { activityService } from '../../services/activity.service';
import { Resource, Activity } from '../../types';

export const Dashboard = () => {
  const { user: currentUser } = useAuth();
  const [webSearchResults, setWebSearchResults] = useState<any>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [stats, setStats] = useState({
    totalResources: 0,
    totalViews: 0,
    activeUsers: 0,
    downloads: 0
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await checkDatabaseConnection();
        setDbStatus(status);
        console.log('MongoDB connection status:', status);
      } catch (err) {
        console.error('Failed to check DB connection:', err);
      }
    };
    
    checkConnection();
  }, []);
  
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        console.log('Fetching resources for user:', currentUser);
        
        if (currentUser?.semester) {
          const cachedResources = localStorage.getItem(`resources-${currentUser.semester}`);
          const cachedTimestamp = localStorage.getItem(`resources-timestamp-${currentUser.semester}`);
          
          const isCacheFresh = cachedTimestamp && (Date.now() - parseInt(cachedTimestamp) < 300000);
          
          if (cachedResources && isCacheFresh) {
            console.log('Using cached resources');
            setResources(JSON.parse(cachedResources));
            calculateStats(JSON.parse(cachedResources));
          } else {
            console.log('Fetching fresh resources');
            const fetchedResources = await getResources({ semester: currentUser.semester });
            
            if (Array.isArray(fetchedResources)) {
              localStorage.setItem(`resources-${currentUser.semester}`, JSON.stringify(fetchedResources));
              localStorage.setItem(`resources-timestamp-${currentUser.semester}`, Date.now().toString());
              
              setResources(fetchedResources);
              calculateStats(fetchedResources);
            } else {
              console.error('Invalid resources format:', fetchedResources);
              setError('Received invalid data format from server');
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        setError('Failed to load resources. Please try again later.');
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    const calculateStats = (resources: any[]) => {
      const totalResources = resources.length;
      const totalViews = resources.reduce((total, resource) => 
        total + (resource.stats?.views || 0), 0);
      const downloads = resources.reduce((total, resource) => 
        total + (resource.stats?.downloads || 0), 0);
      
      setStats({
        totalResources,
        totalViews,
        activeUsers: Math.min(totalResources * 2, 15),
        downloads
      });
    };
    
    if (currentUser) {
      fetchResources();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const fetchedActivities = await activityService.getRecentActivities(10);
        setActivities(fetchedActivities || []);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        setActivities([]);
      }
    };

    fetchActivities();
  }, []);
  
  useEffect(() => {
    const handleGlobalSearch = (event: any) => {
      setWebSearchResults(event.detail);
    };
    
    document.addEventListener('globalSearch', handleGlobalSearch);
    
    return () => {
      document.removeEventListener('globalSearch', handleGlobalSearch);
    };
  }, []);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900">
      <SearchBar />
      
      <div className="mt-8">
        <UserBanner />
      </div>

      {dbStatus && !dbStatus.connected && (
        <div className="my-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded">
          <p className="font-medium">MongoDB Connection Issue</p>
          <p className="text-sm">{dbStatus.message || 'Cannot connect to MongoDB'}</p>
        </div>
      )}

      {webSearchResults && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all duration-300 animate-fadeIn relative">
          <button 
            onClick={() => setWebSearchResults(null)}
            className="absolute right-3 top-3 p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Close search results"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          
          <div className="flex items-center mb-4">
            <Globe className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Web Search Results: {webSearchResults.query}
            </h2>
          </div>
          
          <div className="mb-6 p-5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">AI Summary</h3>
            <div className="text-gray-600 dark:text-gray-400 prose prose-indigo max-w-none">
              {webSearchResults.aiSummary && webSearchResults.aiSummary.split('\n').map((paragraph: string, i: number) => (
                paragraph ? <p key={i} className="mb-2">{paragraph}</p> : <br key={i} />
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {webSearchResults.results && webSearchResults.results.map((result: any, index: number) => (
              <div key={index} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-400">{result.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.link}</p>
                <p className="mt-2 text-gray-700 dark:text-gray-300">{result.snippet}</p>
                <a 
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Visit Resource →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <QuickAccess />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard
          title="Total Resources"
          value={stats.totalResources.toString()}
          change={loading ? "loading..." : "12%"}
          icon={<BookOpen className="h-6 w-6 text-indigo-600" />}
        />
        <AnalyticsCard
          title="Total Views"
          value={stats.totalViews.toString()}
          change={loading ? "loading..." : "8%"}
          icon={<BarChart2 className="h-6 w-6 text-indigo-600" />}
        />
        <AnalyticsCard
          title="Active Users"
          value={stats.activeUsers.toString()}
          change={loading ? "loading..." : "15%"}
          icon={<Users className="h-6 w-6 text-indigo-600" />}
        />
        <AnalyticsCard
          title="Downloads"
          value={stats.downloads.toString()}
          change={loading ? "loading..." : "5%"}
          icon={<Download className="h-6 w-6 text-indigo-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : resources && resources.length > 0 ? (
            <SemesterResources 
              semester={currentUser?.semester || 1} 
              resources={resources as any} 
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">No resources available for your semester.</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Check back later or ask your faculty to upload resources.</p>
            </div>
          )}
        </div>
        <div>
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
};
