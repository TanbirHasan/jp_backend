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
    }
  | {
      type: 'job_alert';
      to: string;
      userName: string;
      jobTitle: string;
      companyName: string;
      location: string | null;
      jobType: string;
      jobId: number;
    }
  | {
      type: 'company_new_job';
      to: string;
      userName: string;
      companyName: string;
      jobTitle: string;
      location: string | null;
      jobType: string;
      jobId: number;
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
