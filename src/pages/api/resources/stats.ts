
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB, { verifyDbConnection } from '../../../lib/db/connect';
import { Resource } from '../../../lib/db/models/Resource';
import { Activity } from '../../../lib/db/models/Activity';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // For GET requests - return resource statistics
  if (req.method === 'GET') {
    try {
      // Connect to MongoDB
      await connectDB();
      
      // Verify connection
      const dbStatus = await verifyDbConnection();
      if (!dbStatus.connected) {
        console.error('MongoDB connection issue:', dbStatus.message);
        return res.status(500).json({ 
          error: 'Database connection error', 
          details: dbStatus.message 
        });
      }
      
      // Get total resource count
      const totalResources = await Resource.countDocuments();
      
      // Get resource type distribution
      const typeDistribution = await Resource.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);
      
      // Format for frontend
      const formattedTypeDistribution = typeDistribution.map(type => ({
        name: type._id === 'document' ? 'Document' : 
              type._id === 'video' ? 'Video' : 
              type._id === 'link' ? 'Link' : 'Note',
        value: type.count
      }));
      
      // Get recent activities for resources
      const recentActivities = await Activity.find()
        .sort({ timestamp: -1 })
        .limit(15)
        .populate('user', 'fullName')
        .populate('resource', 'title');
      
      // Get daily stats for the past week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const dailyStats = await Resource.aggregate([
        {
          $match: {
            createdAt: { $gte: oneWeekAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" }
            },
            uploads: { $sum: 1 },
            date: { $first: "$createdAt" }
          }
        },
        { $sort: { date: 1 } }
      ]);
      
      // Get download stats
      const downloadStats = await Activity.aggregate([
        {
          $match: {
            type: "download",
            timestamp: { $gte: oneWeekAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$timestamp" },
              month: { $month: "$timestamp" },
              day: { $dayOfMonth: "$timestamp" }
            },
            downloads: { $sum: 1 },
            date: { $first: "$timestamp" }
          }
        },
        { $sort: { date: 1 } }
      ]);
      
      // Get view stats
      const viewStats = await Activity.aggregate([
        {
          $match: {
            type: "view",
            timestamp: { $gte: oneWeekAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$timestamp" },
              month: { $month: "$timestamp" },
              day: { $dayOfMonth: "$timestamp" }
            },
            views: { $sum: 1 },
            date: { $first: "$timestamp" }
          }
        },
        { $sort: { date: 1 } }
      ]);
      
      // Combine stats into daily activity format for charts
      const dailyActivity = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateYMD = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        
        // Find matching stats
        const upload = dailyStats.find(item => 
          item._id.year === date.getFullYear() && 
          item._id.month === (date.getMonth() + 1) && 
          item._id.day === date.getDate()
        );
        
        const download = downloadStats.find(item => 
          item._id.year === date.getFullYear() && 
          item._id.month === (date.getMonth() + 1) && 
          item._id.day === date.getDate()
        );
        
        const view = viewStats.find(item => 
          item._id.year === date.getFullYear() && 
          item._id.month === (date.getMonth() + 1) && 
          item._id.day === date.getDate()
        );
        
        dailyActivity.push({
          name: dateStr,
          date: dateYMD,
          uploads: upload ? upload.uploads : 0,
          downloads: download ? download.downloads : 0,
          views: view ? view.views : 0
        });
      }
      
      return res.status(200).json({
        success: true,
        totalResources,
        typeDistribution: formattedTypeDistribution,
        dailyActivity,
        dailyStats,
        recentActivities
      });
    } catch (error) {
      console.error('Error getting resource stats:', error);
      return res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
    }
  }
  
  // For POST requests - track resource stats
  if (req.method === 'POST') {
    try {
      // Connect to MongoDB
      await connectDB();
      
      // Verify connection
      const dbStatus = await verifyDbConnection();
      if (!dbStatus.connected) {
        console.error('MongoDB connection issue:', dbStatus.message);
        return res.status(500).json({ 
          error: 'Database connection error', 
          details: dbStatus.message 
        });
      }
      
      const { resourceId, action, userId } = req.body;
      
      if (!resourceId || !action) {
        return res.status(400).json({ error: 'resourceId and action are required' });
      }
      
      const resource = await Resource.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      // Update the appropriate stat
      switch (action) {
        case 'view':
          // Initialize stats if needed
          if (!resource.stats) {
            resource.stats = {
              views: 0,
              downloads: 0,
              likes: 0,
              comments: 0,
              lastViewed: new Date(),
              dailyViews: []
            };
          }
          
          // Update view count
          resource.stats.views += 1;
          resource.stats.lastViewed = new Date();
          
          // Update or create daily view count
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (!resource.stats.dailyViews) {
            resource.stats.dailyViews = [];
          }
          
          const todayViewIndex = resource.stats.dailyViews.findIndex(view => {
            if (!view || !view.date) return false;
            const viewDate = new Date(view.date);
            return viewDate.toDateString() === today.toDateString();
          });
          
          if (todayViewIndex >= 0) {
            resource.stats.dailyViews[todayViewIndex].count += 1;
          } else {
            resource.stats.dailyViews.push({
              date: today,
              count: 1
            });
          }
          
          // Create activity record if userId is provided
          if (userId) {
            try {
              await Activity.create({
                user: new mongoose.Types.ObjectId(userId),
                type: 'view',
                resource: resource._id,
                details: { timestamp: new Date() },
                timestamp: new Date()
              });
            } catch (activityError) {
              console.error('Failed to create activity record:', activityError);
              // Continue with view tracking even if activity creation fails
            }
          }
          break;
          
        case 'download':
          if (!resource.stats) {
            resource.stats = {
              views: 0,
              downloads: 0,
              likes: 0,
              comments: 0,
              lastViewed: new Date()
            };
          }
          resource.stats.downloads += 1;
          
          // Create activity record if userId is provided
          if (userId) {
            try {
              await Activity.create({
                user: new mongoose.Types.ObjectId(userId),
                type: 'download',
                resource: resource._id,
                details: { timestamp: new Date() },
                timestamp: new Date()
              });
            } catch (activityError) {
              console.error('Failed to create activity record:', activityError);
            }
          }
          break;
          
        case 'like':
          if (!resource.stats) {
            resource.stats = {
              views: 0,
              downloads: 0,
              likes: 0,
              comments: 0,
              lastViewed: new Date()
            };
          }
          
          // Do not increment here, as likes are managed by likedBy array
          // Just make sure the stats reflect the array count
          resource.stats.likes = resource.likedBy.length;
          
          // Add user to likedBy array if userId is provided
          if (userId && !resource.likedBy.includes(userId)) {
            resource.likedBy.push(userId);
            
            // Create activity record
            try {
              await Activity.create({
                user: new mongoose.Types.ObjectId(userId),
                type: 'like',
                resource: resource._id,
                details: { timestamp: new Date() },
                timestamp: new Date()
              });
            } catch (activityError) {
              console.error('Failed to create like activity record:', activityError);
            }
          }
          break;
          
        case 'comment':
          if (!resource.stats) {
            resource.stats = {
              views: 0,
              downloads: 0,
              likes: 0,
              comments: 0,
              lastViewed: new Date()
            };
          }
          resource.stats.comments = resource.comments ? resource.comments.length : 0;
          
          // Create activity record if userId is provided
          if (userId) {
            try {
              await Activity.create({
                user: new mongoose.Types.ObjectId(userId),
                type: 'comment',
                resource: resource._id,
                details: { timestamp: new Date() },
                timestamp: new Date()
              });
            } catch (activityError) {
              console.error('Failed to create comment activity record:', activityError);
            }
          }
          break;
          
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
      
      await resource.save();
      
      return res.status(200).json({ 
        success: true, 
        stats: resource.stats
      });
    } catch (error) {
      console.error('Error updating resource stats:', error);
      return res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
