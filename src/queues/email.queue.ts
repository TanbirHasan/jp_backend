import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export type EmailJobData =
  | {
      type: 'application_confirmation';
      to: string;
      applicantName: string;
      jobTitle: string;
      companyName: string;
    }
  | {
      type: 'status_update';
      to: string;
      applicantName: string;
      jobTitle: string;
      companyName: string;
      status: string;
    };

export const emailQueue = new Queue<EmailJobData>('email', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});
