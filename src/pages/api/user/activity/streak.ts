
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/db/connect';
import { User } from '../../../../lib/db/models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get user from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

    // Find user and update streak
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update streak only for meaningful activities
    await user.updateStreak();

    return res.status(200).json({ 
      success: true, 
      streak: user.streak,
      message: 'Streak updated successfully' 
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
