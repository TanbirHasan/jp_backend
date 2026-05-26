import { pool } from '../config/db';
import { JobAlert, JobType } from '../types';

interface AlertMatch {
  alert_id: number;
  user_id: number;
  email: string;
  name: string;
}

async function create(
  userId: number,
  data: { keywords?: string; job_type?: JobType; location?: string }
): Promise<JobAlert> {
  const result = await pool.query<JobAlert>(
    `INSERT INTO job_alerts (user_id, keywords, job_type, location)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, data.keywords ?? null, data.job_type ?? null, data.location ?? null]
  );
  return result.rows[0];
}

async function findByUser(userId: number): Promise<JobAlert[]> {
  const result = await pool.query<JobAlert>(
    'SELECT * FROM job_alerts WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

async function findById(id: number): Promise<JobAlert | null> {
  const result = await pool.query<JobAlert>(
    'SELECT * FROM job_alerts WHERE id = $1',
    [id]
  );
  return result.rows[0] ?? null;
}

async function deleteById(id: number): Promise<void> {
  await pool.query('DELETE FROM job_alerts WHERE id = $1', [id]);
}

// Returns every subscriber whose filter criteria match the given job
async function findMatchingAlerts(job: {
  title: string;
  job_type: string;
  location: string | null;
}): Promise<AlertMatch[]> {
  const result = await pool.query<AlertMatch>(
    `SELECT ja.id AS alert_id, u.id AS user_id, u.email, u.name
     FROM job_alerts ja
     JOIN users u ON ja.user_id = u.id
     WHERE (ja.keywords IS NULL OR $1 ILIKE '%' || ja.keywords || '%')
       AND (ja.job_type  IS NULL OR ja.job_type = $2)
       AND (ja.location  IS NULL OR $3 ILIKE '%' || ja.location || '%')`,
    [job.title, job.job_type, job.location ?? '']
  );
  return result.rows;
}

export { create, findByUser, findById, deleteById, findMatchingAlerts };
