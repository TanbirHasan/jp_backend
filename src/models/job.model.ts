import { pool } from '../config/db';
import { Job, JobType, JobFilters, PaginatedResult } from '../types';

interface CreateJobData {
  company_id: number;
  title: string;
  description: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  job_type: JobType;
}

const ALLOWED_SORT_FIELDS = ['created_at', 'salary_min', 'salary_max'] as const;

async function findAll(filters: JobFilters = {}): Promise<PaginatedResult<Job>> {
  const {
    search,
    job_type,
    location,
    salary_min,
    salary_max,
    sort = 'created_at',
    order = 'desc',
    page = 1,
    limit = 10,
  } = filters;

  const conditions: string[] = ["j.status = 'open'"];
  const params: unknown[] = [];
  let i = 1;

  if (search) {
    conditions.push(
      `to_tsvector('english', j.title || ' ' || j.description) @@ plainto_tsquery('english', $${i})`
    );
    params.push(search);
    i++;
  }

  if (job_type) {
    conditions.push(`j.job_type = $${i}`);
    params.push(job_type);
    i++;
  }

  if (location) {
    conditions.push(`j.location ILIKE $${i}`);
    params.push(`%${location}%`);
    i++;
  }

  if (salary_min !== undefined) {
    conditions.push(`j.salary_min >= $${i}`);
    params.push(salary_min);
    i++;
  }

  if (salary_max !== undefined) {
    conditions.push(`j.salary_max <= $${i}`);
    params.push(salary_max);
    i++;
  }

  const sortField = ALLOWED_SORT_FIELDS.includes(sort as any) ? sort : 'created_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
  const safeLimit = Math.min(Number(limit), 50);
  const offset = (Number(page) - 1) * safeLimit;

  const whereClause = conditions.join(' AND ');

  const result = await pool.query<Job & { total_count: string }>(
    `SELECT j.*, c.name AS company_name,
            COUNT(*) OVER() AS total_count
     FROM jobs j
     JOIN companies c ON j.company_id = c.id
     WHERE ${whereClause}
     ORDER BY j.${sortField} ${sortOrder}
     LIMIT $${i} OFFSET $${i + 1}`,
    [...params, safeLimit, offset]
  );

  const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

  return {
    data: result.rows,
    pagination: {
      total,
      page: Number(page),
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
}

async function findById(id: number): Promise<Job | null> {
  const result = await pool.query<Job>(
    `SELECT j.*, c.name AS company_name, c.website, c.logo_url
     FROM jobs j
     JOIN companies c ON j.company_id = c.id
     WHERE j.id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

async function findByCompanyId(companyId: number): Promise<Job[]> {
  const result = await pool.query<Job>(
    'SELECT * FROM jobs WHERE company_id = $1 ORDER BY created_at DESC',
    [companyId]
  );
  return result.rows;
}

async function create(data: CreateJobData): Promise<Job> {
  const result = await pool.query<Job>(
    `INSERT INTO jobs (company_id, title, description, location, salary_min, salary_max, job_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.company_id,
      data.title,
      data.description,
      data.location ?? null,
      data.salary_min ?? null,
      data.salary_max ?? null,
      data.job_type,
    ]
  );
  return result.rows[0];
}

async function update(
  id: number,
  data: Partial<Omit<Job, 'id' | 'company_id' | 'created_at'>>
): Promise<Job | null> {
  const result = await pool.query<Job>(
    `UPDATE jobs
     SET title       = COALESCE($1, title),
         description = COALESCE($2, description),
         location    = COALESCE($3, location),
         salary_min  = COALESCE($4, salary_min),
         salary_max  = COALESCE($5, salary_max),
         job_type    = COALESCE($6, job_type),
         status      = COALESCE($7, status)
     WHERE id = $8
     RETURNING *`,
    [
      data.title ?? null,
      data.description ?? null,
      data.location ?? null,
      data.salary_min ?? null,
      data.salary_max ?? null,
      data.job_type ?? null,
      data.status ?? null,
      id,
    ]
  );
  return result.rows[0] ?? null;
}

async function remove(id: number): Promise<void> {
  await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
}

async function findByIdAndEmployer(jobId: number, employerId: number): Promise<Job | null> {
  const result = await pool.query<Job>(
    `SELECT j.* FROM jobs j
     JOIN companies c ON j.company_id = c.id
     WHERE j.id = $1 AND c.employer_id = $2`,
    [jobId, employerId]
  );
  return result.rows[0] ?? null;
}

export { findAll, findById, findByCompanyId, create, update, remove, findByIdAndEmployer };

