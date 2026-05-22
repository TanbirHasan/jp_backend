import * as followModel from '../models/follow.model';
import * as companyModel from '../models/company.model';
import { emailQueue } from '../queues/email.queue';
import { Company, CompanyFollow, Job, AppError } from '../types';

async function followCompany(userId: number, companyId: number): Promise<CompanyFollow> {
  const company = await companyModel.findById(companyId);
  if (!company) {
    throw new AppError('Company not found', 404);
  }

  const existing = await followModel.findFollow(userId, companyId);
  if (existing) {
    throw new AppError('You are already following this company', 409);
  }

  return followModel.follow(userId, companyId);
}

async function unfollowCompany(userId: number, companyId: number): Promise<void> {
  const existing = await followModel.findFollow(userId, companyId);
  if (!existing) {
    throw new AppError('You are not following this company', 404);
  }

  await followModel.unfollow(userId, companyId);
}

async function getFollowerCount(companyId: number): Promise<{ follower_count: number }> {
  const company = await companyModel.findById(companyId);
  if (!company) {
    throw new AppError('Company not found', 404);
  }

  const follower_count = await followModel.getFollowerCount(companyId);
  return { follower_count };
}

async function getFollowedCompanies(userId: number) {
  return followModel.getFollowedCompanies(userId);
}

// Called by job.service after a new job is created — fire and forget
async function notifyCompanyFollowers(job: Job, company: Company): Promise<void> {
  const followers = await followModel.getCompanyFollowers(company.id);

  if (followers.length === 0) return;

  await Promise.all(
    followers.map((follower) =>
      emailQueue.add('company_new_job', {
        type: 'company_new_job',
        to: follower.email,
        userName: follower.name,
        companyName: company.name,
        jobTitle: job.title,
        location: job.location ?? null,
        jobType: job.job_type,
        jobId: job.id,
      })
    )
  );
}

export { followCompany, unfollowCompany, getFollowerCount, getFollowedCompanies, notifyCompanyFollowers };
