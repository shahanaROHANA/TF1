import express from 'express';
import { register, login, forgetPassword, resetPassword, googleAuth, googleAuthCallback } from '../controllers/authController.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimitMiddleware.js';
import passport from 'passport';

const router = express.Router();

// Auth routes
router.post('/register', authLimiter, register);
router.post('/login', login);
router.post('/forget-password', passwordResetLimiter, forgetPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', passport.authenticate('google', { session: false }), googleAuthCallback);

export default router;
