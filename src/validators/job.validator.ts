import { z } from 'zod';

const jobTypeEnum = z.enum(['full_time', 'part_time', 'contract', 'remote']);
const jobStatusEnum = z.enum(['open', 'closed']);

const salaryCheck = (data: { salary_min?: number; salary_max?: number }) => {
  if (data.salary_min !== undefined && data.salary_max !== undefined) {
    return data.salary_min <= data.salary_max;
  }
  return true;
};

const salaryError = { message: 'salary_min must be less than or equal to salary_max' };

const baseJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().max(150).optional(),
  salary_min: z.number().int().positive().optional(),
  salary_max: z.number().int().positive().optional(),
  job_type: jobTypeEnum,
});

export const createJobSchema = baseJobSchema.refine(salaryCheck, salaryError);

export const updateJobSchema = baseJobSchema
  .partial()
  .extend({ status: jobStatusEnum.optional() })
  .refine(salaryCheck, salaryError);
