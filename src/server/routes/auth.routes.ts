
import express from 'express';
import { signup, login, verifyEmail, resendVerification } from '../controllers/auth.controller';
import { authMiddleware, adminMiddleware, facultyMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Public auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

// Protected routes that require authentication
router.get('/me', authMiddleware, (req, res) => {
  // Return full user object including role for client-side validation
  res.json({ 
    user: req.user,
    timestamp: new Date().toISOString() 
  });
});

// Admin-only routes
router.get('/admin-check', authMiddleware, (req, res) => {
  // Check explicitly for admin role in the token
  if (req.user && req.user.role === 'admin') {
    res.json({ 
      message: 'You have admin access', 
      user: req.user, 
      timestamp: new Date().toISOString() 
    });
  } else {
    console.error(`Admin access denied for user with role: ${req.user?.role || 'undefined'}`);
    res.status(403).json({ error: 'Admin access required' });
  }
});

// Debug route to check token and role
router.get('/debug-token', authMiddleware, (req, res) => {
  try {
    // Ensure user data exists in request
    if (!req.user) {
      return res.status(401).json({
        error: 'No user data found in token'
      });
    }
    
    // Log for debugging
    console.log('Debug token request - User:', req.user.userId, 'Role:', req.user.role);
    
    // Return detailed user information
    res.json({
      user: req.user,
      role: req.user.role,
      isAdmin: req.user.role === 'admin',
      isFaculty: req.user.role === 'faculty',
      isStudent: req.user.role === 'student',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in debug-token route:', error);
    res.status(500).json({ 
      error: 'Error processing debug-token request',
      message: error.message
    });
  }
});

export default router;
