import * as analyticsModel from '../models/analytics.model';
import { EmployerStats } from '../types';

async function getEmployerStats(employerId: number): Promise<EmployerStats> {
  const row = await analyticsModel.getEmployerStats(employerId);

  return {
    total_jobs_posted: row.total_jobs_posted,
    open_jobs: row.open_jobs,
    total_applications_received: row.total_applications_received,
    applications_this_week: row.applications_this_week,
    most_applied_job: row.most_applied_job_id
      ? {
          id: row.most_applied_job_id,
          title: row.most_applied_job_title!,
          count: row.most_applied_job_count!,
        }
      : null,
  };
}

export { getEmployerStats };
