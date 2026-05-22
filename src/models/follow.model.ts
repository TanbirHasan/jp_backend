import { pool } from '../config/db';
import { Company, CompanyFollow } from '../types';

interface FollowedCompany extends Company {
  followed_at: Date;
}

interface FollowerForEmail {
  user_id: number;
  email: string;
  name: string;
}

async function follow(userId: number, companyId: number): Promise<CompanyFollow> {
  const result = await pool.query<CompanyFollow>(
    `INSERT INTO company_followers (user_id, company_id)
     VALUES ($1, $2)
     RETURNING *`,
    [userId, companyId]
  );
  return result.rows[0];
}

async function unfollow(userId: number, companyId: number): Promise<void> {
  await pool.query(
    'DELETE FROM company_followers WHERE user_id = $1 AND company_id = $2',
    [userId, companyId]
  );
}

async function findFollow(userId: number, companyId: number): Promise<CompanyFollow | null> {
  const result = await pool.query<CompanyFollow>(
    'SELECT * FROM company_followers WHERE user_id = $1 AND company_id = $2',
    [userId, companyId]
  );
  return result.rows[0] ?? null;
}

async function getFollowerCount(companyId: number): Promise<number> {
  const result = await pool.query<{ count: string }>(
    'SELECT COUNT(*) FROM company_followers WHERE company_id = $1',
    [companyId]
  );
  return parseInt(result.rows[0].count, 10);
}

async function getFollowedCompanies(userId: number): Promise<FollowedCompany[]> {
  const result = await pool.query<FollowedCompany>(
    `SELECT c.*, cf.followed_at
     FROM company_followers cf
     JOIN companies c ON cf.company_id = c.id
     WHERE cf.user_id = $1
     ORDER BY cf.followed_at DESC`,
    [userId]
  );
  return result.rows;
}

async function getCompanyFollowers(companyId: number): Promise<FollowerForEmail[]> {
  const result = await pool.query<FollowerForEmail>(
    `SELECT u.id AS user_id, u.email, u.name
     FROM company_followers cf
     JOIN users u ON cf.user_id = u.id
     WHERE cf.company_id = $1`,
    [companyId]
  );
  return result.rows;
}

export { follow, unfollow, findFollow, getFollowerCount, getFollowedCompanies, getCompanyFollowers };
