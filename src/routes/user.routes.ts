import { Router } from 'express';
import { getUsers, getMe } from '../controllers/user.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.get('/me', protect, getMe);
router.get('/', protect, restrictTo('admin'), getUsers);

export default router;
