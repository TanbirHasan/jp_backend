import { Request, Response, NextFunction } from 'express';
import * as jobService from '../services/job.service';

async function getAllJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, job_type, location, salary_min, salary_max, sort, order, page, limit } = req.query;

    const result = await jobService.getAllJobs({
      search: search as string,
      job_type: job_type as any,
      location: location as string,
      salary_min: salary_min ? Number(salary_min) : undefined,
      salary_max: salary_max ? Number(salary_max) : undefined,
      sort: sort as any,
      order: order as any,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    res.status(200).json({ data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
}

async function getJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const job = await jobService.getJob(Number(req.params.id));
    res.status(200).json({ data: { job } });
  } catch (error) {
    next(error);
  }
}

async function createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const job = await jobService.createJob(req.user!.id, req.body);
    res.status(201).json({ data: { job } });
  } catch (error) {
    next(error);
  }
}

async function updateJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const job = await jobService.updateJob(Number(req.params.id), req.user!.id, req.body);
    res.status(200).json({ data: { job } });
  } catch (error) {
    next(error);
  }
}

async function deleteJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await jobService.deleteJob(Number(req.params.id), req.user!.id);
    res.status(200).json({ data: { message: 'Job deleted successfully' } });
  } catch (error) {
    next(error);
  }
}

export { getAllJobs, getJob, createJob, updateJob, deleteJob };
