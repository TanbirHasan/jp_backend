import * as alertModel from '../models/alert.model';
import { emailQueue } from '../queues/email.queue';
import { Job, JobAlert, JobType, AppError } from '../types';

async function createAlert(
  userId: number,
  data: { keywords?: string; job_type?: JobType; location?: string }
): Promise<JobAlert> {
  return alertModel.create(userId, data);
}

async function getMyAlerts(userId: number): Promise<JobAlert[]> {
  return alertModel.findByUser(userId);
}

async function deleteAlert(alertId: number, userId: number): Promise<void> {
  const alert = await alertModel.findById(alertId);

  if (!alert) {
    throw new AppError('Alert not found', 404);
  }

  if (alert.user_id !== userId) {
    throw new AppError('You do not have permission to delete this alert', 403);
  }

  await alertModel.deleteById(alertId);
}

// Called by job.service after a new job is created — fire and forget
async function notifyMatchingAlerts(job: Job, companyName: string): Promise<void> {
  const matches = await alertModel.findMatchingAlerts({
    title: job.title,
    job_type: job.job_type,
    location: job.location ?? null,
  });

  if (matches.length === 0) return;

  await Promise.all(
    matches.map((match) =>
      emailQueue.add('job_alert', {
        type: 'job_alert',
        to: match.email,
        userName: match.name,
        jobTitle: job.title,
        companyName,
        location: job.location ?? null,
        jobType: job.job_type,
        jobId: job.id,
      })
    )
  );
}

export { createAlert, getMyAlerts, deleteAlert, notifyMatchingAlerts };
