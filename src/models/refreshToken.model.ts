import { pool } from '../config/db';

async function create(userId: number, token: string, expiresAt: Date): Promise<void> {
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
}

async function findByToken(token: string) {
  const result = await pool.query(
    'SELECT * FROM refresh_tokens WHERE token = $1',
    [token]
  );
  return result.rows[0] ?? null;
}

async function deleteByToken(token: string): Promise<void> {
  await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
}

async function deleteAllForUser(userId: number): Promise<void> {
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
}

export { create, findByToken, deleteByToken, deleteAllForUser };
