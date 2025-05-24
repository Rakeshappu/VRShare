
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/db/connect';
import { Resource } from '../../../lib/db/models/Resource';
import { Activity } from '../../../lib/db/models/Activity';
import jwt from 'jsonwebtoken';

interface ActivityData {
  _id: string;
  count: number;
  uniqueUsers: number;
  lastActivity: Date;
}

interface ResourceWithStats {
  _id: string;
  title: string;
  description: string;
  type: string;
  subject: string;
  semester: number;
  department: string;
  uploadedBy: any;
  createdAt: Date;
  stats: {
    views: number;
    downloads: number;
    likes: number;
    uniqueUsers: number;
    lastActivity: Date;
    score: number;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { semester, department, limit = 10 } = req.query;

    // Get current user context if available
    let userContext = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        userContext = decoded;
      } catch (error) {
        // Continue without user context
      }
    }

    // Build match criteria
    const matchCriteria: any = {};
    if (semester) {
      matchCriteria.semester = parseInt(semester as string);
    }
    if (department) {
      matchCriteria.department = department as string;
    }

    // Get trending activity data from the last 7 days
    const trendingActivities = await Activity.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          type: { $in: ['view', 'download', 'like'] },
          resource: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$resource',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' },
          lastActivity: { $max: '$timestamp' }
        }
      },
      {
        $addFields: {
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      {
        $match: {
          count: { $gte: 2 } // At least 2 interactions
        }
      },
      {
        $sort: { count: -1, uniqueUsers: -1 }
      },
      {
        $limit: parseInt(limit as string) * 2 // Get more to filter later
      }
    ]);

    // Get resource details
    const resourceIds = trendingActivities.map((activity: ActivityData) => activity._id);
    let resourceQuery: any = {
      _id: { $in: resourceIds }
    };

    // Add semester/department filters to resource query
    if (semester) {
      resourceQuery.semester = parseInt(semester as string);
    }
    if (department) {
      resourceQuery.department = department as string;
    }

    const resources = await Resource.find(resourceQuery)
      .populate('uploadedBy', 'fullName')
      .lean();

    // Combine resources with their trending stats
    const trendingResources: ResourceWithStats[] = resources.map((resource: any) => {
      const activity = trendingActivities.find((a: ActivityData) => a._id.toString() === resource._id.toString());
      
      // Calculate trending score
      const views = activity?.count || 0;
      const uniqueUsers = activity?.uniqueUsers || 0;
      const recency = activity?.lastActivity ? (Date.now() - new Date(activity.lastActivity).getTime()) / (1000 * 60 * 60) : 168; // hours ago, default to 1 week
      const score = (views * 2 + uniqueUsers * 5) / Math.max(1, recency / 24); // Boost recent activity

      return {
        ...resource,
        stats: {
          views,
          downloads: 0, // Could be calculated separately if needed
          likes: 0, // Could be calculated separately if needed
          uniqueUsers,
          lastActivity: activity?.lastActivity || resource.createdAt,
          score
        }
      };
    });

    // Sort by trending score
    trendingResources.sort((a: ResourceWithStats, b: ResourceWithStats) => b.stats.score - a.stats.score);

    return res.status(200).json({
      resources: trendingResources.slice(0, parseInt(limit as string)),
      total: trendingResources.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching trending resources:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
