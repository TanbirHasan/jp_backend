import { Request, Response, NextFunction } from 'express';
import * as companyService from '../services/company.service';
import { AppError } from '../types';

async function createCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await companyService.createCompany(req.user!.id, req.body);
    res.status(201).json({ data: { company } });
  } catch (error) {
    next(error);
  }
}

async function getCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await companyService.getCompany(Number(req.params.id));
    res.status(200).json({ data: { company } });
  } catch (error) {
    next(error);
  }
}

async function updateCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const company = await companyService.updateCompany(
      Number(req.params.id),
      req.user!.id,
      req.body
    );
    res.status(200).json({ data: { company } });
  } catch (error) {
    next(error);
  }
}

async function uploadLogo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }
    const logoUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    const company = await companyService.updateCompany(
      Number(req.params.id),
      req.user!.id,
      { logo_url: logoUrl }
    );
    res.status(200).json({ data: { company } });
  } catch (error) {
    next(error);
  }
}

export { createCompany, getCompany, updateCompany, uploadLogo };
