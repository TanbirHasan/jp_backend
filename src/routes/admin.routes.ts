import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import {
  getStats,
  listUsers,
  changeUserRole,
  deleteUser,
  listJobs,
  deleteJob,
  listApplications,
  deleteApplication,
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, restrictTo('admin'));

// Stats
router.get('/stats', getStats);

// Users
router.get('/users', listUsers);
router.patch('/users/:id/role', changeUserRole);
router.delete('/users/:id', deleteUser);

// Jobs
router.get('/jobs', listJobs);
router.delete('/jobs/:id', deleteJob);

// Applications
router.get('/applications', listApplications);
router.delete('/applications/:id', deleteApplication);

export default router;
