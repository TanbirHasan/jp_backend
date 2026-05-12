import * as jobModel from '../models/job.model';
import * as companyModel from '../models/company.model';
import { Job, JobType, JobStatus, JobFilters, PaginatedResult, AppError } from '../types';

async function getAllJobs(filters: JobFilters): Promise<PaginatedResult<Job>> {
  return jobModel.findAll(filters);
}

async function getJob(id: number): Promise<Job> {
  const job = await jobModel.findById(id);
  if (!job) {
    throw new AppError('Job not found', 404);
  }
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

  return jobModel.create({ ...data, company_id: company.id });
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
  return updated!;
}

async function deleteJob(jobId: number, employerId: number): Promise<void> {
  const job = await jobModel.findByIdAndEmployer(jobId, employerId);
  if (!job) {
    throw new AppError('Job not found or you do not have permission to delete it', 404);
  }

  await jobModel.remove(jobId);
}

export { getAllJobs, getJob, createJob, updateJob, deleteJob };
