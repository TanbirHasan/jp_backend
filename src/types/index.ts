export type UserRole = 'job_seeker' | 'employer' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}

export interface AuthResult {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRow {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export type JobType = 'full_time' | 'part_time' | 'contract' | 'remote';
export type JobStatus = 'open' | 'closed';
export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected';

export interface JobFilters {
  search?: string;
  job_type?: JobType;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  sort?: 'created_at' | 'salary_min' | 'salary_max';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

export interface Company {
  id: number;
  employer_id: number;
  name: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  created_at: Date;
}

export interface Job {
  id: number;
  company_id: number;
  title: string;
  description: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  job_type: JobType;
  status: JobStatus;
  created_at: Date;
}

export interface Application {
  id: number;
  job_id: number;
  applicant_id: number;
  resume_url: string | null;
  status: ApplicationStatus;
  applied_at: Date;
}

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
