import { pool } from '../config/db';

interface StatsRow {
  total_jobs_posted: number;
  open_jobs: number;
  total_applications_received: number;
  applications_this_week: number;
  most_applied_job_id: number | null;
  most_applied_job_title: string | null;
  most_applied_job_count: number | null;
}

// Single round-trip: four CTEs feed one SELECT so PostgreSQL plans them together
async function getEmployerStats(employerId: number): Promise<StatsRow> {
  const result = await pool.query<StatsRow>(
    `WITH employer_company AS (
       SELECT id FROM companies WHERE employer_id = $1
     ),
     job_stats AS (
       SELECT
         COUNT(*)::int                                          AS total_jobs_posted,
         COUNT(*) FILTER (WHERE j.status = 'open')::int        AS open_jobs
       FROM jobs j
       WHERE j.company_id = (SELECT id FROM employer_company)
     ),
     app_stats AS (
       SELECT
         COUNT(*)::int                                          AS total_applications_received,
         COUNT(*) FILTER (
           WHERE a.applied_at >= NOW() - INTERVAL '7 days'
         )::int                                                 AS applications_this_week
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.company_id = (SELECT id FROM employer_company)
     ),
     top_job AS (
       SELECT j.id, j.title, COUNT(a.id)::int AS application_count
       FROM jobs j
       LEFT JOIN applications a ON a.job_id = j.id
       WHERE j.company_id = (SELECT id FROM employer_company)
       GROUP BY j.id, j.title
       ORDER BY application_count DESC
       LIMIT 1
     )
     SELECT
       js.total_jobs_posted,
       js.open_jobs,
       aps.total_applications_received,
       aps.applications_this_week,
       tj.id                AS most_applied_job_id,
       tj.title             AS most_applied_job_title,
       tj.application_count AS most_applied_job_count
     FROM job_stats js
     CROSS JOIN app_stats aps
     LEFT JOIN top_job tj ON true`,
    [employerId]
  );
  return result.rows[0];
}

export { getEmployerStats };
