
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/db/connect';
import { User } from '../../../../lib/db/models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, role: string };
      
      // Ensure the user is an admin
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }
      
      // Get all users
      const users = await User.find({}, {
        _id: 1,
        fullName: 1,
        email: 1,
        role: 1,
        department: 1,
        semester: 1,
        isEmailVerified: 1,
        isAdminVerified: 1,
        avatar: 1,
        lastLogin: 1,
        createdAt: 1,
        gender: 1,
        batch: 1,
        degree: 1,
        usn: 1,
      });
      
      return res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await connectDB();
      
      // Get authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      // Verify token
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, role: string };
      
      // Ensure the user is an admin
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }
      
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      // Prevent admin from deleting their own account
      if (userId === decoded.userId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }
      
      // Delete user
      const result = await User.findByIdAndDelete(userId);
      
      if (!result) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
