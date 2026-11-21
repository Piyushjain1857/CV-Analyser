import express from 'express';
import {
  getResumes,
  getResumeById,
  createResume,
  deleteResume,
} from '../controllers/resumeController.js';
import { uploadResumeFile } from '../middleware/upload.js';
import { aiAnalysisLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/', getResumes);
router.get('/:id', getResumeById);
router.post('/', aiAnalysisLimiter, uploadResumeFile, createResume);
router.delete('/:id', deleteResume);

export default router;
