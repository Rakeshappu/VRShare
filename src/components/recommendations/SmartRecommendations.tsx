
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Clock, 
  Star, 
  ThumbsUp, 
  ThumbsDown,
  ExternalLink,
  Sparkles,
  Target,
  Award,
  Filter,
  Refresh
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { recommendationService, SmartRecommendation, RecommendationContext } from '../../services/recommendation.service';
import { activityService } from '../../services/activity.service';
import { toast } from 'react-hot-toast';

interface SmartRecommendationsProps {
  className?: string;
  maxRecommendations?: number;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({ 
  className = "", 
  maxRecommendations = 6 
}) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('SmartRecommendations component mounted');
    if (user) {
      console.log('User found, loading recommendations for:', user.fullName);
      loadRecommendations();
    } else {
      console.log('No user found');
    }
  }, [user, selectedCategory]);

  const loadRecommendations = async () => {
    if (!user) {
      console.log('No user available for recommendations');
      return;
    }
    
    console.log('Starting to load recommendations...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Build recommendation context
      console.log('Fetching recent activities...');
      const recentActivities = await activityService.getWeeklyActivities();
      console.log('Recent activities:', recentActivities);
      
      const context: RecommendationContext = {
        recentActivities: recentActivities || [],
        studyHistory: [],
        timeOfDay: getTimeOfDay(),
        semester: user.semester || 1,
        department: user.department || 'CSE'
      };

      console.log('Recommendation context:', context);
      console.log('Calling recommendation service...');
      
      const recs = await recommendationService.getPersonalizedRecommendations(context);
      console.log('Received recommendations:', recs);
      
      // Filter by category if selected
      const filteredRecs = selectedCategory === 'all' 
        ? recs 
        : recs.filter(rec => rec.type === selectedCategory);
      
      console.log('Filtered recommendations:', filteredRecs);
      
      if (filteredRecs.length === 0) {
        console.log('No recommendations found, generating fallback');
        // Generate some fallback recommendations
        const fallbackRecs = generateFallbackRecommendations(context);
        setRecommendations(fallbackRecs.slice(0, maxRecommendations));
      } else {
        setRecommendations(filteredRecs.slice(0, maxRecommendations));
      }
      
      toast.success(`Found ${filteredRecs.length} personalized recommendations!`);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setError('Failed to load recommendations');
      
      // Generate fallback recommendations on error
      const context: RecommendationContext = {
        recentActivities: [],
        studyHistory: [],
        timeOfDay: getTimeOfDay(),
        semester: user.semester || 1,
        department: user.department || 'CSE'
      };
      const fallbackRecs = generateFallbackRecommendations(context);
      setRecommendations(fallbackRecs);
      
      toast.error('Using offline recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackRecommendations = (context: RecommendationContext): SmartRecommendation[] => {
    console.log('Generating fallback recommendations');
    return [
      {
        id: 'fallback-1',
        title: `${context.department} Semester ${context.semester} Study Guide`,
        description: 'Comprehensive study materials for your current semester and department',
        type: 'study_path',
        confidence: 0.8,
        reasoning: 'Tailored to your current academic level and department',
        estimatedTime: '45-60 minutes',
        difficulty: 'intermediate',
        tags: [context.department.toLowerCase(), `semester-${context.semester}`, 'study-guide'],
        popularity: 150,
        aiGenerated: true
      },
      {
        id: 'fallback-2',
        title: 'Popular Resources This Week',
        description: 'Most viewed and downloaded resources by students in your department',
        type: 'trending',
        confidence: 0.75,
        reasoning: 'High engagement from peers in similar courses',
        estimatedTime: '30-45 minutes',
        difficulty: 'beginner',
        tags: ['trending', 'popular', context.department.toLowerCase()],
        popularity: 89,
        aiGenerated: false
      },
      {
        id: 'fallback-3',
        title: 'AI-Curated Learning Path',
        description: 'Personalized study sequence based on your learning patterns',
        type: 'ai_suggested',
        confidence: 0.9,
        reasoning: 'AI analysis of successful learning patterns for students like you',
        estimatedTime: '60-90 minutes',
        difficulty: 'advanced',
        tags: ['ai-generated', 'personalized', 'learning-path'],
        popularity: 234,
        aiGenerated: true
      }
    ];
  };

  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const handleFeedback = async (recommendationId: string, feedback: 'like' | 'dislike') => {
    try {
      await recommendationService.recordRecommendationFeedback(recommendationId, feedback);
      setFeedbackGiven(prev => new Set([...prev, recommendationId]));
      toast.success('Thanks for your feedback!');
    } catch (error) {
      console.error('Error recording feedback:', error);
      toast.error('Failed to record feedback');
    }
  };

  const refreshRecommendations = () => {
    toast.loading('Refreshing recommendations...');
    loadRecommendations();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trending': return <TrendingUp className="h-4 w-4" />;
      case 'ai_suggested': return <Brain className="h-4 w-4" />;
      case 'study_path': return <Target className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trending': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'ai_suggested': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'study_path': return 'bg-blue-100 text-blue-600 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!user) {
    return (
      <div className={`${className} bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border`}>
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Please log in to see personalized recommendations</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Smart Recommendations
          </h2>
          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
            AI-Powered
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshRecommendations}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh recommendations"
          >
            <Refresh className="h-4 w-4" />
          </button>
          
          <div className="flex space-x-1">
            {[
              { key: 'all', label: 'All', icon: BookOpen },
              { key: 'trending', label: 'Trending', icon: TrendingUp },
              { key: 'ai_suggested', label: 'AI', icon: Brain },
              { key: 'study_path', label: 'Path', icon: Target }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-3"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded flex-1"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No recommendations yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Start exploring resources to get personalized recommendations!
          </p>
          <button
            onClick={refreshRecommendations}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Generate Recommendations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 hover:border-purple-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(rec.type)}`}>
                    {getTypeIcon(rec.type)}
                    <span className="capitalize">{rec.type.replace('_', ' ')}</span>
                  </div>
                  
                  {rec.aiGenerated && (
                    <div className="flex items-center space-x-1 text-purple-600">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">AI</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {rec.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                    {rec.description}
                  </p>
                  
                  {rec.reasoning && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        💡 {rec.reasoning}
                      </p>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {rec.estimatedTime && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{rec.estimatedTime}</span>
                    </div>
                  )}
                  
                  {rec.difficulty && (
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(rec.difficulty)}`}>
                      {rec.difficulty}
                    </span>
                  )}
                  
                  {rec.popularity > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Users className="h-3 w-3" />
                      <span>{rec.popularity}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex space-x-2">
                    {!feedbackGiven.has(rec.id) ? (
                      <>
                        <button
                          onClick={() => handleFeedback(rec.id, 'like')}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="Helpful"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleFeedback(rec.id, 'dislike')}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Not helpful"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center space-x-1 text-green-600">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-xs">Thanks!</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {Array(5).fill(0).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${
                          i < Math.round(rec.confidence * 5) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      {Math.round(rec.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default SmartRecommendations;
