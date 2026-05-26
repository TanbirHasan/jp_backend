import { pool } from '../config/db';
import { AppError, UserRole } from '../types';

async function getStats() {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM users)                          AS total_users,
      (SELECT COUNT(*)::int FROM users WHERE role = 'job_seeker') AS total_job_seekers,
      (SELECT COUNT(*)::int FROM users WHERE role = 'employer')   AS total_employers,
      (SELECT COUNT(*)::int FROM companies)                      AS total_companies,
      (SELECT COUNT(*)::int FROM jobs)                           AS total_jobs,
      (SELECT COUNT(*)::int FROM jobs WHERE status = 'open')     AS open_jobs,
      (SELECT COUNT(*)::int FROM applications)                   AS total_applications
  `);
  return result.rows[0];
}

async function listUsers() {
  const result = await pool.query(
    `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`
  );
  return result.rows;
}

async function changeUserRole(userId: number, role: UserRole) {
  const result = await pool.query(
    `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role`,
    [role, userId]
  );
  if (result.rowCount === 0) throw new AppError('User not found', 404);
  return result.rows[0];
}

async function deleteUser(userId: number) {
  const result = await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
  if (result.rowCount === 0) throw new AppError('User not found', 404);
}

async function listJobs() {
  const result = await pool.query(`
    SELECT j.id, j.title, j.location, j.job_type, j.status, j.created_at,
           c.name AS company_name,
           u.name AS employer_name, u.email AS employer_email
    FROM   jobs j
    JOIN   companies c ON c.id = j.company_id
    JOIN   users     u ON u.id = c.employer_id
    ORDER  BY j.created_at DESC
  `);
  return result.rows;
}

async function deleteJob(jobId: number) {
  const result = await pool.query(`DELETE FROM jobs WHERE id = $1`, [jobId]);
  if (result.rowCount === 0) throw new AppError('Job not found', 404);
}

async function listApplications() {
  const result = await pool.query(`
    SELECT a.id, a.status, a.applied_at, a.resume_url,
           u.id   AS applicant_id,
           u.name AS applicant_name, u.email AS applicant_email,
           j.id   AS job_id,
           j.title AS job_title,
           c.name  AS company_name
    FROM   applications a
    JOIN   users u ON u.id = a.applicant_id
    JOIN   jobs  j ON j.id = a.job_id
    JOIN   companies c ON c.id = j.company_id
    ORDER  BY a.applied_at DESC
  `);
  return result.rows;
}

async function deleteApplication(applicationId: number) {
  const result = await pool.query(`DELETE FROM applications WHERE id = $1`, [applicationId]);
  if (result.rowCount === 0) throw new AppError('Application not found', 404);
}

export {
  getStats,
  listUsers,
  changeUserRole,
  deleteUser,
  listJobs,
  deleteJob,
  listApplications,
  deleteApplication,
};
