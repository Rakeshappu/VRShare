
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/db/connect';
import { notifyResourceUpload } from '../../../lib/realtime/socket';
import jwt from 'jsonwebtoken';
import { User } from '../../../lib/db/models/User';
import { Notification } from '../../../lib/db/models/Notification';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
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
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify the user is a faculty member or admin
    if (user.role !== 'faculty' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Only faculty members and admins can send resource notifications' });
    }
    
    const { resourceId, facultyName, resourceTitle, semester } = req.body;
    
    if (!resourceId) {
      return res.status(400).json({ error: 'Resource ID is required' });
    }
    
    console.log(`API route: sending notification for resource ${resourceId} by ${facultyName || user.fullName} for semester ${semester}`);
    
    // Create database notifications for students in the specified semester
    try {
      // Find students in the specified semester
      const query = semester ? { role: 'student', semester: Number(semester) } : { role: 'student' };
      const students = await User.find(query).select('_id');
      
      console.log(`Found ${students.length} students to notify in semester ${semester || 'all'}`);
      
      // Create notification for each student
      const notificationData = students.map(student => ({
        userId: student._id,
        message: `${facultyName || user.fullName} uploaded a new resource: ${resourceTitle}`,
        resourceId: new mongoose.Types.ObjectId(resourceId),
        read: false,
        createdAt: new Date()
      }));
      
      if (notificationData.length > 0) {
        await Notification.insertMany(notificationData);
        console.log(`Created ${notificationData.length} database notifications`);
      }
    } catch (dbError) {
      console.error('Error creating database notifications:', dbError);
      // Continue with real-time notifications even if database notifications fail
    }
    
    // Send real-time notifications through socket.io
    try {
      await notifyResourceUpload(
        resourceId, 
        facultyName || user.fullName, 
        resourceTitle, 
        semester
      );
      
      console.log(`Real-time notification sent successfully for resource ${resourceId} to semester ${semester || 'all'}`);
      
      return res.status(200).json({
        success: true,
        message: `Notification sent successfully to semester ${semester || 'all'}`,
      });
    } catch (notifyError) {
      console.error('Error in notification process:', notifyError);
      return res.status(500).json({ 
        error: 'Failed to send notification', 
        details: (notifyError as Error).message 
      });
    }
  } catch (error) {
    console.error('Error sending resource notification:', error);
    return res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
}
