import express from 'express';
import authRoutes from './authRoutes.js';
import healthRoutes from './healthRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import analysisRoutes from './analysisRoutes.js';
import profileRoutes from './profileRoutes.js';
import statsRoutes from './statsRoutes.js';
import chatRoutes from './chatRoutes.js';
import builderRoutes from './builderRoutes.js';
import roadmapRoutes from './roadmapRoutes.js';
import interviewRoutes from './interviewRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
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
router.use('/builder', protect, builderRoutes);
router.use('/roadmap', protect, roadmapRoutes);
router.use('/interview', protect, interviewRoutes);
router.use('/analytics', protect, analyticsRoutes);

export default router;
