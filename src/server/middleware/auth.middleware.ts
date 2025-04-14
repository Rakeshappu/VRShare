
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
    
    // Log successful authentication
    console.log(`Authenticated user: ${decoded.userId} with role: ${decoded.role}`);
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin-only middleware
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Faculty-only middleware
export const facultyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'faculty' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Faculty access required' });
  }
  next();
};
