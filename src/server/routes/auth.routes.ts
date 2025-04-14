
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
  res.json({ user: req.user });
});

// Admin-only routes
router.get('/admin-check', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: 'You have admin access', user: req.user });
});

export default router;
