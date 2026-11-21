import express from 'express';
import {
  getLatestAnalysis,
  getAnalysisById,
  compareAnalyses,
  reanalyzeWithJobDescription,
  getAnalysisHistory,
  clearAnalysisHistory,
  exportAnalysisPdf,
  deleteAnalysis,
  analyzeCustomText,
} from '../controllers/analysisController.js';
import { aiAnalysisLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/latest', getLatestAnalysis);
router.get('/history', getAnalysisHistory);
router.delete('/history/clear', clearAnalysisHistory);
router.get('/compare/:id1/:id2', compareAnalyses);
router.get('/:id/pdf', exportAnalysisPdf);
router.get('/:id', getAnalysisById);
router.delete('/:id', deleteAnalysis);
router.post('/:id/match-jd', aiAnalysisLimiter, reanalyzeWithJobDescription);
router.post('/rematch/:id', aiAnalysisLimiter, reanalyzeWithJobDescription);
router.post('/preview', analyzeCustomText);

export default router;
