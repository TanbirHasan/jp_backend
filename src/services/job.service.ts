import * as jobModel from '../models/job.model';
import * as companyModel from '../models/company.model';
import { notifyMatchingAlerts } from './alert.service';
import { notifyCompanyFollowers } from './follow.service';
import { cache } from '../utils/cache';
import { Job, JobType, JobStatus, JobFilters, PaginatedResult, CursorFilters, CursorPaginatedResult, AppError } from '../types';

const JOB_TTL = 300;      // 5 minutes for individual jobs
const LISTING_TTL = 60;   // 60 seconds for job listings

async function getAllJobs(filters: JobFilters): Promise<PaginatedResult<Job>> {
  const cacheKey = `jobs:${JSON.stringify(filters)}`;

  const cached = await cache.get<PaginatedResult<Job>>(cacheKey);
  if (cached) return cached;

  const result = await jobModel.findAll(filters);
  await cache.set(cacheKey, result, LISTING_TTL);

  return result;
}

async function getAllJobsCursor(filters: CursorFilters): Promise<CursorPaginatedResult<Job>> {
  const cacheKey = `jobs:cursor:${JSON.stringify(filters)}`;

  const cached = await cache.get<CursorPaginatedResult<Job>>(cacheKey);
  if (cached) return cached;

  const result = await jobModel.findAllCursor(filters);
  await cache.set(cacheKey, result, LISTING_TTL);

  return result;
}

async function getJob(id: number): Promise<Job> {
  const cacheKey = `job:${id}`;

  const cached = await cache.get<Job>(cacheKey);
  if (cached) return cached;

  const job = await jobModel.findById(id);
  if (!job) throw new AppError('Job not found', 404);

  await cache.set(cacheKey, job, JOB_TTL);
  return job;
}

async function createJob(
  employerId: number,
  data: {
    title: string;
    description: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    job_type: JobType;
  }
): Promise<Job> {
  const company = await companyModel.findByEmployerId(employerId);
  if (!company) {
    throw new AppError('You must create a company profile before posting jobs', 400);
  }

  if (!data.title || !data.description || !data.job_type) {
    throw new AppError('Title, description, and job type are required', 400);
  }

  const job = await jobModel.create({ ...data, company_id: company.id });
  await cache.delByPattern('jobs:*');

  // Fire-and-forget — never block job creation for alert delivery
  notifyMatchingAlerts(job, company.name).catch((err) =>
    console.error('[Alerts] Failed to notify subscribers:', err.message)
  );

  notifyCompanyFollowers(job, company).catch((err) =>
    console.error('[Follow] Failed to notify followers:', err.message)
  );

  return job;
}

async function updateJob(
  jobId: number,
  employerId: number,
  data: Partial<{ title: string; description: string; location: string; salary_min: number; salary_max: number; job_type: JobType; status: JobStatus }>
): Promise<Job> {
  const job = await jobModel.findByIdAndEmployer(jobId, employerId);
  if (!job) {
    throw new AppError('Job not found or you do not have permission to edit it', 404);
  }

  const updated = await jobModel.update(jobId, data);

  await Promise.all([
    cache.del(`job:${jobId}`),
    cache.delByPattern('jobs:*'),
  ]);

  return updated!;
}

async function deleteJob(jobId: number, employerId: number): Promise<void> {
  const job = await jobModel.findByIdAndEmployer(jobId, employerId);
  if (!job) {
    throw new AppError('Job not found or you do not have permission to delete it', 404);
  }

  await jobModel.remove(jobId);

  await Promise.all([
    cache.del(`job:${jobId}`),
    cache.delByPattern('jobs:*'),
  ]);
}

export { getAllJobs, getAllJobsCursor, getJob, createJob, updateJob, deleteJob };
