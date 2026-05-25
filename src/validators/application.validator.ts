import { z } from 'zod';

export const applyToJobSchema = z.object({
  resume_url: z.string().url('Invalid resume URL').optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['pending', 'reviewing', 'accepted', 'rejected']),
});
