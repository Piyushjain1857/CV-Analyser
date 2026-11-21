import express from 'express';
import {
  signup,
  login,
  logout,
  getMe,
  changePassword,
  updatePrivacySettings,
  exportUserData,
  deleteAccount,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public auth endpoints with brute force rate limiting
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

// Protected account & privacy endpoints
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
router.post('/privacy-settings', protect, updatePrivacySettings);
router.get('/export-data', protect, exportUserData);
router.delete('/delete-account', protect, deleteAccount);

export default router;
