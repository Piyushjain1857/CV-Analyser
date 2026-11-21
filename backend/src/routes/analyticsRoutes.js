import express from 'express';
import { getCareerAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/', getCareerAnalytics);

export default router;
