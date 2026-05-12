import { Router } from 'express';
import { getAllJobs, getJob, createJob, updateJob, deleteJob } from '../controllers/job.controller';
import { getJobApplicants, applyToJob } from '../controllers/application.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getAllJobs);
router.get('/:id', getJob);
router.post('/', protect, restrictTo('employer'), createJob);
router.patch('/:id', protect, restrictTo('employer'), updateJob);
router.delete('/:id', protect, restrictTo('employer'), deleteJob);

router.post('/:id/apply', protect, restrictTo('job_seeker'), applyToJob);
router.get('/:id/applicants', protect, restrictTo('employer'), getJobApplicants);

export default router;
