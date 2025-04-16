
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/db/connect';
import { Activity } from '../../../lib/db/models/Activity';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Get activities for a specific user
  if (req.method === 'GET') {
    try {
      await connectDB();
      
      // Get authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      // Verify token
      const token = authHeader.split(' ')[1];
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, role?: string };
        if (!decoded || !decoded.userId) {
          return res.status(401).json({ error: 'Invalid token' });
        }
      } catch (tokenError) {
        console.error('Token verification error:', tokenError);
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      const userId = req.query.userId || decoded.userId;
      const limit = Number(req.query.limit) || 20;
      const page = Number(req.query.page) || 1;
      const skip = (page - 1) * limit;
      
      // Make sure the user can only see their own activities unless they're an admin
      if (userId !== decoded.userId && decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized to view this user\'s activities' });
      }
      
      // Query activities
      const activities = await Activity.find({ user: userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('resource', 'title type')
        .lean();
      
      const total = await Activity.countDocuments({ user: userId });
      
      return res.status(200).json({
        success: true,
        activities,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
    }
  }
  
  // Create new activity record
  if (req.method === 'POST') {
    try {
      await connectDB();
      
      // Get authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      // Verify token
      const token = authHeader.split(' ')[1];
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
        if (!decoded || !decoded.userId) {
          return res.status(401).json({ error: 'Invalid token' });
        }
      } catch (tokenError) {
        console.error('Token verification error:', tokenError);
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      const { type, resourceId, details } = req.body;
      
      if (!type || !resourceId) {
        return res.status(400).json({ error: 'Type and resourceId are required' });
      }
      
      // Create activity
      const activity = await Activity.create({
        user: new mongoose.Types.ObjectId(decoded.userId),
        type,
        resource: new mongoose.Types.ObjectId(resourceId),
        details: details || {},
        timestamp: new Date()
      });
      
      return res.status(201).json({
        success: true,
        activity
      });
    } catch (error) {
      console.error('Error creating activity:', error);
      return res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
