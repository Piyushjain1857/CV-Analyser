import express from 'express';
import {
  getInterviewQuestions,
  evaluateAnswer,
  getInterviewHistory,
} from '../controllers/interviewController.js';

const router = express.Router();

router.post('/questions', getInterviewQuestions);
router.post('/evaluate', evaluateAnswer);
router.get('/history', getInterviewHistory);

export default router;
