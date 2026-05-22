import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import companyRoutes from './company.routes';
import jobRoutes from './job.routes';
import applicationRoutes from './application.routes';
import alertRoutes from './alert.routes';
import employerRoutes from './employer.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/alerts', alertRoutes);
router.use('/employers', employerRoutes);

export default router;
