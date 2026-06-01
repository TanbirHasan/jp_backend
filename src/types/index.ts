export type UserRole = 'job_seeker' | 'employer' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  registered_as: 'job_seeker' | 'employer';
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

export interface CursorFilters {
  search?: string;
  job_type?: JobType;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  cursor?: number;
  limit?: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CursorPagination {
  nextCursor: number | null;
  hasMore: boolean;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

export interface CursorPaginatedResult<T> {
  data: T[];
  pagination: CursorPagination;
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

export interface CompanyFollow {
  id: number;
  user_id: number;
  company_id: number;
  followed_at: Date;
}

export interface JobAlert {
  id: number;
  user_id: number;
  keywords: string | null;
  job_type: JobType | null;
  location: string | null;
  created_at: Date;
}

export interface EmployerStats {
  total_jobs_posted: number;
  open_jobs: number;
  total_applications_received: number;
  applications_this_week: number;
  most_applied_job: {
    id: number;
    title: string;
    count: number;
  } | null;
}

export type TrackerStatus =
  | 'applied'
  | 'assessment'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'ghosted'
  | 'withdrawn';

export interface TrackerEntry {
  id: number;
  user_id: number;
  job_title: string;
  company_name: string;
  job_url: string | null;
  platform: string | null;
  location: string | null;
  job_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  applied_date: Date;
  deadline: Date | null;
  application_status: TrackerStatus;
  task_link: string | null;
  task_deadline: Date | null;
  interview_date: Date | null;
  interview_type: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TrackerFilters {
  status?: TrackerStatus;
  platform?: string;
  sort?: 'applied_date' | 'deadline' | 'created_at';
  order?: 'asc' | 'desc';
}

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
