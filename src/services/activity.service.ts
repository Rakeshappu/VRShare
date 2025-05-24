
import api from './api';
import { User } from '../lib/db/models/User';

interface ActivityData {
  type: 'view' | 'download' | 'like' | 'comment' | 'upload' | 'search' | 'bookmark';
  resourceId?: string;
  message?: string;
  details?: any;
  source?: string;
}

class ActivityService {
  async logActivity(activityData: ActivityData) {
    try {
      const response = await api.post('/api/user/activity', activityData);
      
      // Only update streak for meaningful activities (not just login)
      if (['view', 'download', 'like', 'bookmark', 'upload'].includes(activityData.type)) {
        await this.updateDailyStreak();
      }
      
      return response.data;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  async getActivities(limit: number = 10) {
    try {
      const response = await api.get(`/api/user/activity?limit=${limit}`);
      return response.data.activities || [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  async getUserDailyStreak(): Promise<number> {
    try {
      const response = await api.get('/api/user/stats');
      return response.data.streak || 0;
    } catch (error) {
      console.error('Error fetching user streak:', error);
      return 0;
    }
  }

  async updateDailyStreak(): Promise<void> {
    try {
      // This will be handled by the backend when logging meaningful activities
      await api.post('/api/user/activity/streak');
    } catch (error) {
      console.error('Error updating daily streak:', error);
    }
  }

  async getTodayActivities(): Promise<number> {
    try {
      const response = await api.get('/api/user/activity/stats?period=today');
      return response.data.count || 0;
    } catch (error) {
      console.error('Error fetching today activities:', error);
      return 0;
    }
  }

  async getWeeklyActivities(): Promise<any[]> {
    try {
      const response = await api.get('/api/user/activity/stats?period=week');
      return response.data.activities || [];
    } catch (error) {
      console.error('Error fetching weekly activities:', error);
      return [];
    }
  }
}

export const activityService = new ActivityService();
