import { pool } from '../config/db';
import * as applicationModel from '../models/application.model';
import * as jobModel from '../models/job.model';
import * as userModel from '../models/user.model';
import * as emailService from './email.service';
import { Application, ApplicationStatus, AppError } from '../types';

async function applyToJob(jobId: number, applicantId: number, resumeUrl?: string): Promise<Application> {
  const job = await jobModel.findById(jobId);
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  if (job.status === 'closed') {
    throw new AppError('This job is no longer accepting applications', 400);
  }

  const existing = await applicationModel.findByJobAndApplicant(jobId, applicantId);
  if (existing) {
    throw new AppError('You have already applied to this job', 409);
  }

  // Transaction: check + insert atomically so concurrent requests cannot produce duplicates
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const check = await client.query(
      'SELECT id FROM applications WHERE job_id = $1 AND applicant_id = $2',
      [jobId, applicantId]
    );
    if (check.rows.length > 0) {
      throw new AppError('You have already applied to this job', 409);
    }

    const result = await client.query<Application>(
      'INSERT INTO applications (job_id, applicant_id, resume_url) VALUES ($1, $2, $3) RETURNING *',
      [jobId, applicantId, resumeUrl ?? null]
    );

    await client.query('COMMIT');
    const application = result.rows[0];

    const [applicant, jobWithCompany] = await Promise.all([
      userModel.findById(applicantId),
      jobModel.findById(jobId),
    ]);

    if (applicant && jobWithCompany) {
      const jobRow = jobWithCompany as typeof jobWithCompany & { company_name: string };
      emailService
        .sendApplicationConfirmation({
          to: applicant.email,
          applicantName: applicant.name,
          jobTitle: jobRow.title,
          companyName: jobRow.company_name,
        })
        .catch((err) => console.error('[Email] Failed to send confirmation:', err.message));
    }

    return application;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getMyApplications(applicantId: number): Promise<Application[]> {
  return applicationModel.findByApplicant(applicantId);
}

async function getJobApplicants(jobId: number, employerId: number): Promise<Application[]> {
  const job = await jobModel.findByIdAndEmployer(jobId, employerId);
  if (!job) {
    throw new AppError('Job not found or you do not have permission to view applicants', 404);
  }

  return applicationModel.findByJob(jobId);
}

async function updateApplicationStatus(
  applicationId: number,
  employerId: number,
  status: ApplicationStatus
): Promise<Application> {
  const application = await applicationModel.findByIdAndEmployer(applicationId, employerId);
  if (!application) {
    throw new AppError('Application not found or you do not have permission to update it', 404);
  }

  const updated = await applicationModel.updateStatus(applicationId, status);

  applicationModel
    .findByIdWithDetails(applicationId)
    .then((details) => {
      if (!details) return;
      return emailService.sendStatusUpdate({
        to: details.applicant_email,
        applicantName: details.applicant_name,
        jobTitle: details.job_title,
        companyName: details.company_name,
        status,
      });
    })
    .catch((err) => console.error('[Email] Failed to send status update:', err.message));

  return updated!;
}

export { applyToJob, getMyApplications, getJobApplicants, updateApplicationStatus };
