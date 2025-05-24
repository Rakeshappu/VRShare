
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/db/connect';
import { Resource } from '../../../lib/db/models/Resource';
import { Activity } from '../../../lib/db/models/Activity';
import { User } from '../../../lib/db/models/User';
import jwt from 'jsonwebtoken';

interface ActivityData {
  _id: string;
  count: number;
  users: string[];
  lastActivity: Date;
}

interface ResourceData {
  _id: string;
  title: string;
  description: string;
  type: string;
  subject: string;
  semester: number;
}

interface RecommendationData {
  resourceId: string;
  title: string;
  description: string;
  type: string;
  subject: string;
  resource: ResourceData;
  peerCount: number;
  totalInteractions: number;
  similarity: number;
  lastActivity: Date;
  tags: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { semester, department } = req.query;

    if (!semester || !department) {
      return res.status(400).json({ error: 'Semester and department are required' });
    }

    // Get current user if authenticated
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        currentUserId = decoded.userId;
      } catch (error) {
        // Continue without user context
      }
    }

    // Find similar users (same semester and department)
    const similarUsers = await User.find({
      semester: parseInt(semester as string),
      department: department as string,
      _id: { $ne: currentUserId } // Exclude current user
    }).limit(20);

    if (similarUsers.length === 0) {
      return res.status(200).json({ recommendations: [] });
    }

    const similarUserIds = similarUsers.map(user => user._id);

    // Get popular resources among similar users
    const popularActivities = await Activity.aggregate([
      {
        $match: {
          user: { $in: similarUserIds },
          type: { $in: ['view', 'download', 'like'] },
          timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      },
      {
        $group: {
          _id: '$resource',
          count: { $sum: 1 },
          users: { $addToSet: '$user' },
          lastActivity: { $max: '$timestamp' }
        }
      },
      {
        $match: {
          count: { $gte: 2 }, // At least 2 interactions
          _id: { $ne: null }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get the actual resource details
    const resourceIds = popularActivities.map((activity: ActivityData) => activity._id);
    const resources = await Resource.find({
      _id: { $in: resourceIds }
    }).populate('uploadedBy', 'fullName');

    // Combine activity data with resource details
    const recommendations: RecommendationData[] = resources.map((resource: ResourceData) => {
      const activity = popularActivities.find((a: ActivityData) => a._id.toString() === resource._id.toString());
      
      return {
        resourceId: resource._id,
        title: resource.title,
        description: resource.description,
        type: resource.type,
        subject: resource.subject,
        resource: resource,
        peerCount: activity?.users.length || 0,
        totalInteractions: activity?.count || 0,
        similarity: Math.min(activity?.users.length / 10, 1), // Normalize similarity score
        lastActivity: activity?.lastActivity,
        tags: [resource.subject, resource.type, `semester-${resource.semester}`]
      };
    });

    // Sort by peer count and similarity
    recommendations.sort((a: RecommendationData, b: RecommendationData) => {
      const scoreA = a.peerCount * a.similarity;
      const scoreB = b.peerCount * b.similarity;
      return scoreB - scoreA;
    });

    return res.status(200).json({
      recommendations: recommendations.slice(0, 5),
      similarUsers: similarUsers.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching peer-based recommendations:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
