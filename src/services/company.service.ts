import * as companyModel from '../models/company.model';
import { Company, AppError } from '../types';

async function createCompany(
  employerId: number,
  data: { name: string; description?: string; website?: string }
): Promise<Company> {
  const existing = await companyModel.findByEmployerId(employerId);
  if (existing) {
    throw new AppError('You already have a company profile', 409);
  }

  if (!data.name) {
    throw new AppError('Company name is required', 400);
  }

  return companyModel.create(employerId, data);
}

async function getCompany(id: number): Promise<Company> {
  const company = await companyModel.findById(id);
  if (!company) {
    throw new AppError('Company not found', 404);
  }
  return company;
}

async function updateCompany(
  companyId: number,
  employerId: number,
  data: { name?: string; description?: string; website?: string; logo_url?: string }
): Promise<Company> {
  const company = await companyModel.findById(companyId);
  if (!company) {
    throw new AppError('Company not found', 404);
  }

  if (company.employer_id !== employerId) {
    throw new AppError('You do not have permission to update this company', 403);
  }

  const updated = await companyModel.update(companyId, data);
  return updated!;
}

export { createCompany, getCompany, updateCompany };
