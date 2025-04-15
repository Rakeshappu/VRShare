
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

// Extend the Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add user info to request object
    req.user = decoded;
    
    // Log successful authentication with more details
    console.log(`Authenticated user: ${decoded.userId} with role: ${decoded.role}`);
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin-only middleware with improved logging
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Log the user role for debugging
  console.log('Checking admin access:', req.user?.role);
  
  if (!req.user) {
    console.error('Admin access denied: No user found in request');
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  // Check if user has admin role - using strict equality comparison
  if (req.user.role !== 'admin') {
    console.error(`Admin access denied for user with role: ${req.user.role || 'undefined'}`);
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  console.log('Admin access granted for user:', req.user.userId);
  next();
};

// Faculty-only middleware with improved logging
export const facultyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Log the user role for debugging
  console.log('Checking faculty access:', req.user?.role);
  
  if (!req.user || (req.user.role !== 'faculty' && req.user.role !== 'admin')) {
    console.error(`Faculty access denied for user with role: ${req.user?.role || 'undefined'}`);
    return res.status(403).json({ error: 'Faculty access required' });
  }
  
  console.log('Faculty access granted for user:', req.user.userId);
  next();
};
