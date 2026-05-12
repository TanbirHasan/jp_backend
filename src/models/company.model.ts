import { pool } from '../config/db';
import { Company } from '../types';

async function findById(id: number): Promise<Company | null> {
  const result = await pool.query<Company>(
    'SELECT * FROM companies WHERE id = $1',
    [id]
  );
  return result.rows[0] ?? null;
}

async function findByEmployerId(employerId: number): Promise<Company | null> {
  const result = await pool.query<Company>(
    'SELECT * FROM companies WHERE employer_id = $1',
    [employerId]
  );
  return result.rows[0] ?? null;
}

async function create(
  employerId: number,
  data: { name: string; description?: string; website?: string }
): Promise<Company> {
  const result = await pool.query<Company>(
    `INSERT INTO companies (employer_id, name, description, website)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [employerId, data.name, data.description ?? null, data.website ?? null]
  );
  return result.rows[0];
}

async function update(
  id: number,
  data: { name?: string; description?: string; website?: string; logo_url?: string }
): Promise<Company | null> {
  const result = await pool.query<Company>(
    `UPDATE companies
     SET name        = COALESCE($1, name),
         description = COALESCE($2, description),
         website     = COALESCE($3, website),
         logo_url    = COALESCE($4, logo_url)
     WHERE id = $5
     RETURNING *`,
    [data.name ?? null, data.description ?? null, data.website ?? null, data.logo_url ?? null, id]
  );
  return result.rows[0] ?? null;
}

export { findById, findByEmployerId, create, update };
