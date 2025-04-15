
import jwt from 'jsonwebtoken';

// Generate token with explicit role field
export const generateToken = (userId: string, role: string = 'student') => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// Verify token and ensure it returns proper type with role
export const verifyToken = (token: string) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string; exp: number };
    
    // Ensure role is always present
    if (!decoded.role) {
      console.warn('Token missing role information', decoded);
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};
