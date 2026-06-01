import { pool } from '../config/db';
import { User, UserWithPassword, UserRole } from '../types';

interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

async function findAll(): Promise<User[]> {
  const result = await pool.query<User>(
    'SELECT id, name, email, role, registered_as, created_at FROM users ORDER BY id DESC'
  );
  return result.rows;
}

async function findById(id: number): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT id, name, email, role, registered_as, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function findByEmail(email: string): Promise<UserWithPassword | null> {
  const result = await pool.query<UserWithPassword>(
    'SELECT id, name, email, password, role, registered_as, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

async function create({ name, email, password, role = 'job_seeker' }: CreateUserPayload): Promise<User> {
  const registeredAs = role === 'employer' ? 'employer' : 'job_seeker';
  const result = await pool.query<User>(
    `INSERT INTO users (name, email, password, role, registered_as)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, registered_as, created_at`,
    [name, email, password, role, registeredAs]
  );
  return result.rows[0];
}

export { findAll, findById, findByEmail, create };
