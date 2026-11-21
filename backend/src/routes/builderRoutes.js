import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listBuilderResumes,
  getBuilderResume,
  createBuilderResume,
  importFromUploadedResume,
  updateBuilderResume,
  autosaveBuilderResume,
  duplicateBuilderResume,
  deleteBuilderResume,
  saveVersionSnapshot,
  listVersions,
  restoreVersion,
  improveText,
  optimizeForJob,
  exportPdf,
} from '../controllers/builderController.js';

const router = Router();

// All builder routes are guarded with authenticated HTTP-only cookie JWT
router.use(requireAuth);

// Resume CRUD & Duplication
router.get('/', listBuilderResumes);
router.post('/', createBuilderResume);
router.post('/import/:resumeId', importFromUploadedResume);
router.get('/:id', getBuilderResume);
router.put('/:id', updateBuilderResume);
router.post('/:id/autosave', autosaveBuilderResume);
router.post('/:id/duplicate', duplicateBuilderResume);
router.delete('/:id', deleteBuilderResume);

// Versioning
router.post('/:id/version', saveVersionSnapshot);
router.get('/:id/versions', listVersions);
router.post('/:id/restore/:versionId', restoreVersion);

// AI Writing Assistant & Targeted Job Optimization
router.post('/ai/improve-text', improveText);
router.post('/ai/optimize-for-job', optimizeForJob);

// PDF Export (Vector Selectable Text)
router.get('/:id/export/pdf', exportPdf);

export default router;
