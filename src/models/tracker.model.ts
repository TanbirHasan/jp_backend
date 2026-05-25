import { pool } from '../config/db';
import { TrackerEntry, TrackerFilters, TrackerStatus } from '../types';

type CreateData = Omit<TrackerEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
type UpdateData = Partial<CreateData>;

async function create(userId: number, data: CreateData): Promise<TrackerEntry> {
  const result = await pool.query<TrackerEntry>(
    `INSERT INTO job_tracker (
       user_id, job_title, company_name, job_url, platform, location, job_type,
       salary_min, salary_max, currency, applied_date, deadline,
       application_status, task_link, task_deadline,
       interview_date, interview_type, notes
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
     ) RETURNING *`,
    [
      userId,
      data.job_title,
      data.company_name,
      data.job_url ?? null,
      data.platform ?? null,
      data.location ?? null,
      data.job_type ?? null,
      data.salary_min ?? null,
      data.salary_max ?? null,
      data.currency ?? 'BDT',
      data.applied_date ?? new Date(),
      data.deadline ?? null,
      data.application_status ?? 'applied',
      data.task_link ?? null,
      data.task_deadline ?? null,
      data.interview_date ?? null,
      data.interview_type ?? null,
      data.notes ?? null,
    ]
  );
  return result.rows[0];
}

async function findAll(userId: number, filters: TrackerFilters): Promise<TrackerEntry[]> {
  const conditions: string[] = ['user_id = $1'];
  const params: unknown[] = [userId];
  let i = 2;

  if (filters.status) {
    conditions.push(`application_status = $${i++}`);
    params.push(filters.status);
  }

  if (filters.platform) {
    conditions.push(`platform ILIKE $${i++}`);
    params.push(`%${filters.platform}%`);
  }

  const allowedSort = ['applied_date', 'deadline', 'created_at'];
  const sort = allowedSort.includes(filters.sort ?? '') ? filters.sort : 'created_at';
  const order = filters.order === 'asc' ? 'ASC' : 'DESC';

  const result = await pool.query<TrackerEntry>(
    `SELECT * FROM job_tracker
     WHERE ${conditions.join(' AND ')}
     ORDER BY ${sort} ${order}`,
    params
  );
  return result.rows;
}

async function findById(id: number): Promise<TrackerEntry | null> {
  const result = await pool.query<TrackerEntry>(
    'SELECT * FROM job_tracker WHERE id = $1',
    [id]
  );
  return result.rows[0] ?? null;
}

async function update(id: number, data: UpdateData): Promise<TrackerEntry | null> {
  const result = await pool.query<TrackerEntry>(
    `UPDATE job_tracker SET
       job_title          = COALESCE($1,  job_title),
       company_name       = COALESCE($2,  company_name),
       job_url            = COALESCE($3,  job_url),
       platform           = COALESCE($4,  platform),
       location           = COALESCE($5,  location),
       job_type           = COALESCE($6,  job_type),
       salary_min         = COALESCE($7,  salary_min),
       salary_max         = COALESCE($8,  salary_max),
       currency           = COALESCE($9,  currency),
       applied_date       = COALESCE($10, applied_date),
       deadline           = COALESCE($11, deadline),
       application_status = COALESCE($12, application_status),
       task_link          = COALESCE($13, task_link),
       task_deadline      = COALESCE($14, task_deadline),
       interview_date     = COALESCE($15, interview_date),
       interview_type     = COALESCE($16, interview_type),
       notes              = COALESCE($17, notes),
       updated_at         = NOW()
     WHERE id = $18
     RETURNING *`,
    [
      data.job_title ?? null,
      data.company_name ?? null,
      data.job_url ?? null,
      data.platform ?? null,
      data.location ?? null,
      data.job_type ?? null,
      data.salary_min ?? null,
      data.salary_max ?? null,
      data.currency ?? null,
      data.applied_date ?? null,
      data.deadline ?? null,
      data.application_status ?? null,
      data.task_link ?? null,
      data.task_deadline ?? null,
      data.interview_date ?? null,
      data.interview_type ?? null,
      data.notes ?? null,
      id,
    ]
  );
  return result.rows[0] ?? null;
}

async function deleteById(id: number): Promise<void> {
  await pool.query('DELETE FROM job_tracker WHERE id = $1', [id]);
}

export { create, findAll, findById, update, deleteById };
