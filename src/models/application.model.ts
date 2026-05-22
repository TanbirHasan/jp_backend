import { pool } from '../config/db';
import { Application, ApplicationStatus } from '../types';

async function findByJobAndApplicant(jobId: number, applicantId: number): Promise<Application | null> {
  const result = await pool.query<Application>(
    'SELECT * FROM applications WHERE job_id = $1 AND applicant_id = $2',
    [jobId, applicantId]
  );
  return result.rows[0] ?? null;
}

async function findByApplicant(applicantId: number): Promise<Application[]> {
  const result = await pool.query<Application>(
    `SELECT a.*, j.title AS job_title, j.location, j.job_type, c.name AS company_name
     FROM applications a
     JOIN jobs j ON a.job_id = j.id
     JOIN companies c ON j.company_id = c.id
     WHERE a.applicant_id = $1
     ORDER BY a.applied_at DESC`,
    [applicantId]
  );
  return result.rows;
}

async function findByJob(jobId: number): Promise<Application[]> {
  const result = await pool.query<Application>(
    `SELECT a.*, u.name AS applicant_name, u.email AS applicant_email
     FROM applications a
     JOIN users u ON a.applicant_id = u.id
     WHERE a.job_id = $1
     ORDER BY a.applied_at DESC`,
    [jobId]
  );
  return result.rows;
}

async function create(jobId: number, applicantId: number): Promise<Application> {
  const result = await pool.query<Application>(
    `INSERT INTO applications (job_id, applicant_id)
     VALUES ($1, $2)
     RETURNING *`,
    [jobId, applicantId]
  );
  return result.rows[0];
}

async function updateStatus(id: number, status: ApplicationStatus): Promise<Application | null> {
  const result = await pool.query<Application>(
    'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0] ?? null;
}

async function findByIdAndEmployer(applicationId: number, employerId: number): Promise<Application | null> {
  const result = await pool.query<Application>(
    `SELECT a.* FROM applications a
     JOIN jobs j ON a.job_id = j.id
     JOIN companies c ON j.company_id = c.id
     WHERE a.id = $1 AND c.employer_id = $2`,
    [applicationId, employerId]
  );
  return result.rows[0] ?? null;
}

async function findByIdWithDetails(
  applicationId: number
): Promise<(Application & { applicant_name: string; applicant_email: string; job_title: string; company_name: string }) | null> {
  const result = await pool.query(
    `SELECT a.*,
            u.name  AS applicant_name,
            u.email AS applicant_email,
            j.title AS job_title,
            c.name  AS company_name
     FROM applications a
     JOIN users      u ON a.applicant_id = u.id
     JOIN jobs       j ON a.job_id       = j.id
     JOIN companies  c ON j.company_id   = c.id
     WHERE a.id = $1`,
    [applicationId]
  );
  return result.rows[0] ?? null;
}

async function findByIdForDownload(
  applicationId: number
): Promise<{ resume_url: string | null; applicant_id: number; employer_id: number } | null> {
  const result = await pool.query(
    `SELECT a.resume_url, a.applicant_id, c.employer_id
     FROM applications a
     JOIN jobs      j ON a.job_id       = j.id
     JOIN companies c ON j.company_id   = c.id
     WHERE a.id = $1`,
    [applicationId]
  );
  return result.rows[0] ?? null;
}

export { findByJobAndApplicant, findByApplicant, findByJob, create, updateStatus, findByIdAndEmployer, findByIdWithDetails, findByIdForDownload };
