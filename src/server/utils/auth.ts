
import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, role: string = 'user') => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
  
  // Create token with user ID and role that expires in 7 days
  return jwt.sign({ 
    userId, 
    role 
  }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Log token verification for debugging
    console.log('Token verified successfully:', {
      userId: (decoded as any).userId,
      role: (decoded as any).role,
      exp: new Date((decoded as any).exp * 1000).toISOString()
    });
    
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

export const generateVerificationToken = () => {
  // Generate a random 32 character string
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
};
