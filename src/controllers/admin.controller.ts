import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as adminService from '../services/admin.service';
import { AppError, UserRole } from '../types';

const roleSchema = z.object({
  role: z.enum(['job_seeker', 'employer', 'admin']),
});

async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await adminService.getStats();
    res.status(200).json({ data: { stats } });
  } catch (error) {
    next(error);
  }
}

async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await adminService.listUsers();
    res.status(200).json({ data: { users } });
  } catch (error) {
    next(error);
  }
}

async function changeUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = roleSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.issues[0].message, 400));
    }

    const targetId = Number(req.params.id);
    if (targetId === req.user!.id) {
      return next(new AppError('You cannot change your own role', 400));
    }

    const user = await adminService.changeUserRole(targetId, parsed.data.role as UserRole);
    res.status(200).json({ data: { user } });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const targetId = Number(req.params.id);
    if (targetId === req.user!.id) {
      return next(new AppError('You cannot delete your own account via admin', 400));
    }

    await adminService.deleteUser(targetId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function listJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jobs = await adminService.listJobs();
    res.status(200).json({ data: { jobs } });
  } catch (error) {
    next(error);
  }
}

async function deleteJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await adminService.deleteJob(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function listApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const applications = await adminService.listApplications();
    res.status(200).json({ data: { applications } });
  } catch (error) {
    next(error);
  }
}

async function deleteApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await adminService.deleteApplication(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export {
  getStats,
  listUsers,
  changeUserRole,
  deleteUser,
  listJobs,
  deleteJob,
  listApplications,
  deleteApplication,
};
