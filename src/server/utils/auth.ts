
import jwt from 'jsonwebtoken';

// Generate JWT token with user ID and role
export const generateToken = (userId: string, role: string) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// Verify JWT token
export const verifyToken = (token: string) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Debug the decoded token
    console.log('Decoded token:', decoded);
    
    // Validate that the decoded token has the required fields
    const { userId, role } = decoded as { userId: string, role: string };
    if (!userId || !role) {
      console.error('Invalid token structure: Missing userId or role');
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};
