import { Router } from 'express';
import { getAllJobs, getJob, createJob, updateJob, deleteJob } from '../controllers/job.controller';
import { getJobApplicants, applyToJob } from '../controllers/application.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createJobSchema, updateJobSchema } from '../validators/job.validator';
import { applyToJobSchema } from '../validators/application.validator';

const router = Router();

router.get('/', getAllJobs);
router.get('/:id', getJob);
router.post('/', protect, restrictTo('employer'), validate(createJobSchema), createJob);
router.patch('/:id', protect, restrictTo('employer'), validate(updateJobSchema), updateJob);
router.delete('/:id', protect, restrictTo('employer'), deleteJob);

router.post('/:id/apply', protect, restrictTo('job_seeker'), validate(applyToJobSchema), applyToJob);
router.get('/:id/applicants', protect, restrictTo('employer'), getJobApplicants);

export default router;
