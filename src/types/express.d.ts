declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: 'job_seeker' | 'employer' | 'admin';
      };
    }
  }
}

export {};
