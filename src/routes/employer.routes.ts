import { Router } from 'express';
import { getEmployerStats } from '../controllers/analytics.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', protect, restrictTo('employer'), getEmployerStats);

export default router;
