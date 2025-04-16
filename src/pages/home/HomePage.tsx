
import { Suspense, lazy, useState } from 'react';
import { Loader2, BookOpen, Youtube, FileText, Search } from 'lucide-react';
import { motion } from 'framer-motion';

// Lazy loaded components
const EnhancedAISearch = lazy(() => import('../../components/search/EnhancedAISearch'));
const PaginatedResourceList = lazy(() => import('../../components/resources/PaginatedResourceList'));
const QuickAccess = lazy(() => import('../../components/resources/QuickAccess'));

// Import service
import { getResources } from '../../services/resource.service';

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchPagedResources = async (page: number, limit: number, filters: any = {}) => {
    try {
      const resources = await getResources({
        page,
        limit,
        type: filters.type,
        semester: filters.semester,
        search: filters.search,
        sortOrder: filters.sortOrder,
      });
      
      return {
        resources: Array.isArray(resources) ? resources : [],
        total: Array.isArray(resources) ? resources.length : 0,
        totalPages: Array.isArray(resources) ? Math.ceil(resources.length / limit) : 1
      };
    } catch (error) {
      console.error('Error fetching resources:', error);
      return { resources: [], total: 0, totalPages: 1 };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Learning Portal</h1>
            <p className="mt-1 text-gray-500">
              Discover and access educational resources to enhance your learning
            </p>
          </div>
        </div>
      </header>

      <div className="mb-6">
        <nav className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BookOpen className="inline-block h-4 w-4 mr-2" />
            Dashboard
          </button>
          <button
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'search'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('search')}
          >
            <Search className="inline-block h-4 w-4 mr-2" />
            Advanced Search
          </button>
          <button
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'videos'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('videos')}
          >
            <Youtube className="inline-block h-4 w-4 mr-2" />
            Educational Videos
          </button>
          <button
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText className="inline-block h-4 w-4 mr-2" />
            Course Materials
          </button>
        </nav>
      </div>

      <main>
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <Suspense fallback={<div className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>}>
                <QuickAccess />
              </Suspense>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Recent Resources</h2>
                <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>}>
                  <PaginatedResourceList 
                    fetchResources={fetchPagedResources}
                    initialFilters={{ sortOrder: 'newest' }}
                    pageSize={8}
                    showFilters={false}
                  />
                </Suspense>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Quick Search</h2>
                <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>}>
                  <EnhancedAISearch initialSearchType="educational" />
                </Suspense>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'search' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading search...</span>
              </div>
            }>
              <EnhancedAISearch initialSearchType="educational" />
            </Suspense>
          </motion.div>
        )}

        {activeTab === 'videos' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading videos...</span>
              </div>
            }>
              <EnhancedAISearch initialSearchType="videos" />
            </Suspense>
          </motion.div>
        )}

        {activeTab === 'documents' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading documents...</span>
              </div>
            }>
              <EnhancedAISearch initialSearchType="documents" />
            </Suspense>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
