
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/db/connect';
import { EligibleUSN } from '../../../../lib/db/models/EligibleUSN';
import { User } from '../../../../lib/db/models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, role: string };
    
    // Ensure the user is an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // GET - List all eligible USNs
    if (req.method === 'GET') {
      const { department, semester, isUsed } = req.query;
      
      // Build filter object
      const filter: any = {};
      
      if (department) filter.department = department;
      if (semester) filter.semester = parseInt(semester as string);
      if (isUsed !== undefined) filter.isUsed = isUsed === 'true';
      
      const eligibleUSNs = await EligibleUSN.find(filter).sort({ createdAt: -1 });
      
      return res.status(200).json({ eligibleUSNs });
    }
    
    // POST - Create new eligible USN
    if (req.method === 'POST') {
      const { usn, department, semester } = req.body;
      
      if (!usn || !department || !semester) {
        return res.status(400).json({ error: 'USN, department, and semester are required' });
      }
      
      // Check if USN already exists
      const existingUSN = await EligibleUSN.findOne({ usn: usn.toUpperCase() });
      if (existingUSN) {
        return res.status(400).json({ error: 'USN already exists' });
      }
      
      // Create new eligible USN
      const newEligibleUSN = new EligibleUSN({
        usn: usn.toUpperCase(),
        department,
        semester,
        createdBy: decoded.userId
      });
      
      await newEligibleUSN.save();
      
      return res.status(201).json({ 
        success: true, 
        message: 'Eligible USN created successfully',
        eligibleUSN: newEligibleUSN
      });
    }
    
    // DELETE - Delete all eligible USNs (only for testing)
    if (req.method === 'DELETE') {
      const { all } = req.query;
      
      if (all === 'true') {
        await EligibleUSN.deleteMany({});
        return res.status(200).json({ success: true, message: 'All eligible USNs deleted' });
      } else {
        return res.status(400).json({ error: 'Specify ?all=true to delete all eligible USNs' });
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error managing eligible USNs:', error);
    return res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
}
