import { z } from 'zod';

export const createAlertSchema = z
  .object({
    keywords: z.string().min(1).max(100).optional(),
    job_type: z.enum(['full_time', 'part_time', 'contract', 'remote']).optional(),
    location: z.string().min(1).max(100).optional(),
  })
  .refine(
    (data) =>
      data.keywords !== undefined ||
      data.job_type !== undefined ||
      data.location !== undefined,
    { message: 'At least one of keywords, job_type, or location is required' }
  );
