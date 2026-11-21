import express from 'express';
import {
  getRoadmap,
  generateRoadmap,
  toggleRoadmapTask,
  deleteRoadmap,
} from '../controllers/roadmapController.js';

const router = express.Router();

router.get('/', getRoadmap);
router.post('/generate', generateRoadmap);
router.patch('/:id/task', toggleRoadmapTask);
router.delete('/:id', deleteRoadmap);

export default router;
