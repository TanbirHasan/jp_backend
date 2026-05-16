import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller';
import { authLimiter } from '../middlewares/rateLimiter.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
