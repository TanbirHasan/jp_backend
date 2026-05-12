import { Router } from 'express';
import { getMyApplications, updateApplicationStatus } from '../controllers/application.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.get('/me', protect, restrictTo('job_seeker'), getMyApplications);
router.patch('/:id/status', protect, restrictTo('employer'), updateApplicationStatus);

export default router;
