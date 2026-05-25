import { Router } from 'express';
import { createEntry, getAllEntries, getEntry, updateEntry, deleteEntry } from '../controllers/tracker.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createTrackerSchema, updateTrackerSchema, updateTrackerStatusSchema } from '../validators/tracker.validator';

const router = Router();

// All tracker routes are job_seeker only — personal private data
router.post('/',          protect, restrictTo('job_seeker'), validate(createTrackerSchema), createEntry);
router.get('/',           protect, restrictTo('job_seeker'), getAllEntries);
router.get('/:id',        protect, restrictTo('job_seeker'), getEntry);
router.patch('/:id',      protect, restrictTo('job_seeker'), validate(updateTrackerSchema), updateEntry);
router.patch('/:id/status', protect, restrictTo('job_seeker'), validate(updateTrackerStatusSchema), updateEntry);
router.delete('/:id',     protect, restrictTo('job_seeker'), deleteEntry);

export default router;
