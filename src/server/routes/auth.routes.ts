
import express from 'express';
import { signup, login, verifyEmail, resendVerification } from '../controllers/auth.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

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
router.get('/admin-check', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ 
    message: 'You have admin access', 
    user: req.user, 
    timestamp: new Date().toISOString() 
  });
});

// Debug route to check token and role
router.get('/debug-token', authMiddleware, (req, res) => {
  res.json({
    user: req.user,
    role: req.user.role,
    isAdmin: req.user.role === 'admin',
    isFaculty: req.user.role === 'faculty',
    isStudent: req.user.role === 'student',
    timestamp: new Date().toISOString()
  });
});

export default router;
