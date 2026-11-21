import express from 'express';
import authRoutes from './authRoutes.js';
import healthRoutes from './healthRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import analysisRoutes from './analysisRoutes.js';
import profileRoutes from './profileRoutes.js';
import statsRoutes from './statsRoutes.js';
import chatRoutes from './chatRoutes.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Protected tenant-isolated routes
router.use('/resumes', protect, resumeRoutes);
router.use('/analysis', protect, analysisRoutes);
router.use('/profile', protect, profileRoutes);
router.use('/stats', protect, statsRoutes);
router.use('/chat', protect, chatRoutes);

export default router;
