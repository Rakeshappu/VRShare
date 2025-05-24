
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/db/connect';
import { Resource } from '../../../lib/db/models/Resource';
import { Activity } from '../../../lib/db/models/Activity';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { semester, department, limit = 10, timeframe = 7 } = req.query;

    // Calculate the date for filtering activities
    const daysBack = parseInt(timeframe as string);
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);

    // Build the activity aggregation pipeline
    const activityMatch: any = {
      timestamp: { $gte: dateThreshold },
      type: { $in: ['view', 'download', 'like'] }
    };

    // Get trending resources based on recent activity
    const trendingData = await Activity.aggregate([
      {
        $match: activityMatch
      },
      {
        $group: {
          _id: '$resource',
          totalViews: {
            $sum: {
              $cond: [{ $eq: ['$type', 'view'] }, 1, 0]
            }
          },
          totalDownloads: {
            $sum: {
              $cond: [{ $eq: ['$type', 'download'] }, 1, 0]
            }
          },
          totalLikes: {
            $sum: {
              $cond: [{ $eq: ['$type', 'like'] }, 1, 0]
            }
          },
          uniqueUsers: { $addToSet: '$user' },
          lastActivity: { $max: '$timestamp' }
        }
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' },
          trendingScore: {
            $add: [
              { $multiply: ['$totalViews', 1] },
              { $multiply: ['$totalDownloads', 3] },
              { $multiply: ['$totalLikes', 5] },
              { $multiply: [{ $size: '$uniqueUsers' }, 2] }
            ]
          }
        }
      },
      {
        $match: {
          trendingScore: { $gte: 1 },
          _id: { $ne: null }
        }
      },
      {
        $sort: { trendingScore: -1, lastActivity: -1 }
      },
      {
        $limit: parseInt(limit as string) * 2 // Get more than needed for filtering
      }
    ]);

    // Get the resource IDs for further filtering
    const resourceIds = trendingData.map((activity: any) => activity._id).filter((id: any) => id);

    if (resourceIds.length === 0) {
      return res.status(200).json({ resources: [], count: 0 });
    }

    // Build resource filter
    const resourceFilter: any = {
      _id: { $in: resourceIds }
    };

    if (semester) {
      resourceFilter.semester = parseInt(semester as string);
    }

    if (department) {
      resourceFilter.department = department;
    }

    // Get the actual resources with details
    const resources = await Resource.find(resourceFilter)
      .populate('uploadedBy', 'fullName')
      .lean();

    // Combine resources with trending data
    const trendingResources = resources.map((resource: any) => {
      const trendingInfo = trendingData.find((trend: any) => 
        trend._id && trend._id.toString() === resource._id.toString()
      );

      return {
        ...resource,
        trending: {
          score: trendingInfo?.trendingScore || 0,
          views: trendingInfo?.totalViews || 0,
          downloads: trendingInfo?.totalDownloads || 0,
          likes: trendingInfo?.totalLikes || 0,
          uniqueUsers: trendingInfo?.uniqueUserCount || 0,
          lastActivity: trendingInfo?.lastActivity
        }
      };
    });

    // Sort by trending score
    trendingResources.sort((a: any, b: any) => b.trending.score - a.trending.score);

    // Limit the final results
    const finalResults = trendingResources.slice(0, parseInt(limit as string));

    return res.status(200).json({
      resources: finalResults,
      count: finalResults.length,
      timeframe: daysBack,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error fetching trending resources:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
