import { Router } from 'express';
import { createAlert, getMyAlerts, deleteAlert } from '../controllers/alert.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createAlertSchema } from '../validators/alert.validator';

const router = Router();

router.post('/', protect, restrictTo('job_seeker'), validate(createAlertSchema), createAlert);
router.get('/', protect, restrictTo('job_seeker'), getMyAlerts);
router.delete('/:id', protect, restrictTo('job_seeker'), deleteAlert);

export default router;
