import { Router } from 'express';
import { getMyApplications, updateApplicationStatus, downloadResume } from '../controllers/application.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateApplicationStatusSchema } from '../validators/application.validator';

const router = Router();

router.get('/me', protect, restrictTo('job_seeker'), getMyApplications);
router.get('/:id/resume', protect, downloadResume);
router.patch('/:id/status', protect, restrictTo('employer'), validate(updateApplicationStatusSchema), updateApplicationStatus);

export default router;
