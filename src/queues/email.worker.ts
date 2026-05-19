import { Worker } from 'bullmq';
import { redis } from '../config/redis';
import { sendApplicationConfirmation, sendStatusUpdate } from '../services/email.service';
import { EmailJobData } from './email.queue';

export const emailWorker = new Worker<EmailJobData>(
  'email',
  async (job) => {
    const data = job.data;

    if (data.type === 'application_confirmation') {
      await sendApplicationConfirmation({
        to: data.to,
        applicantName: data.applicantName,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
      });
    }

    if (data.type === 'status_update') {
      await sendStatusUpdate({
        to: data.to,
        applicantName: data.applicantName,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        status: data.status,
      });
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

emailWorker.on('completed', (job) => {
  console.log(`[EmailWorker] Job ${job.id} completed — ${job.data.type} to ${job.data.to}`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`[EmailWorker] Job ${job?.id} failed (attempt ${job?.attemptsMade}) — ${err.message}`);
});
