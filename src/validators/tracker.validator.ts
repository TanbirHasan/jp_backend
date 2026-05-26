import { z } from 'zod';

const trackerStatusEnum = z.enum([
  'applied', 'assessment', 'interview', 'offer', 'rejected', 'ghosted', 'withdrawn',
]);

const salaryCheck = (data: { salary_min?: number; salary_max?: number }) => {
  if (data.salary_min !== undefined && data.salary_max !== undefined) {
    return data.salary_min <= data.salary_max;
  }
  return true;
};

const baseSchema = z.object({
  job_title:          z.string().min(1).max(150),
  company_name:       z.string().min(1).max(150),
  job_url:            z.string().max(500).optional(),
  platform:           z.string().max(100).optional(),
  location:           z.string().max(150).optional(),
  job_type:           z.string().max(50).optional(),
  salary_min:         z.number().int().positive().optional(),
  salary_max:         z.number().int().positive().optional(),
  currency:           z.string().max(10).optional(),
  applied_date:       z.string().optional(),
  deadline:           z.string().optional(),
  application_status: trackerStatusEnum.optional(),
  task_link:          z.string().max(500).optional(),
  task_deadline:      z.string().optional(),
  interview_date:     z.string().optional(),
  interview_type:     z.enum(['phone', 'video', 'onsite']).optional(),
  notes:              z.string().max(2000).optional(),
});

export const createTrackerSchema = baseSchema.refine(salaryCheck, {
  message: 'salary_min must be less than or equal to salary_max',
});

export const updateTrackerSchema = baseSchema.partial().refine(salaryCheck, {
  message: 'salary_min must be less than or equal to salary_max',
});

export const updateTrackerStatusSchema = z.object({
  application_status: trackerStatusEnum,
});
