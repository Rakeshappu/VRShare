
import jwt from 'jsonwebtoken';

// Generate token with explicit role field
export const generateToken = (userId: string, role: string = 'student') => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
  console.log(`Generating token for user: ${userId} with role: ${role}`);
  
  // Ensure role is always included in the token payload
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// Verify token and ensure it returns proper type with role
export const verifyToken = (token: string) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role?: string; exp: number };
    
    // Log what we found
    console.log(`Token verified: userId=${decoded.userId}, role=${decoded.role || 'undefined'}`);
    
    // Ensure role is always present - default to student if missing
    if (!decoded.role) {
      console.warn('Token missing role information', decoded);
      // Add a default role for backward compatibility
      decoded.role = 'student';
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};
