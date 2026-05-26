import { Request, Response, NextFunction } from 'express';
import * as applicationService from '../services/application.service';
import { uploadResumeToCloudinary } from '../config/cloudinary';
import { ApplicationStatus } from '../types';

async function applyToJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let resumeUrl: string | undefined;

    if (req.file) {
      const result = await uploadResumeToCloudinary(req.file.buffer, req.file.originalname);
      resumeUrl = result.secure_url;
    }

    const application = await applicationService.applyToJob(
      Number(req.params.id),
      req.user!.id,
      resumeUrl
    );
    res.status(201).json({ data: { application } });
  } catch (error) {
    next(error);
  }
}

async function getMyApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const applications = await applicationService.getMyApplications(req.user!.id);
    res.status(200).json({ data: { applications } });
  } catch (error) {
    next(error);
  }
}

async function getJobApplicants(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const applications = await applicationService.getJobApplicants(
      Number(req.params.id),
      req.user!.id
    );
    res.status(200).json({ data: { applications } });
  } catch (error) {
    next(error);
  }
}

async function updateApplicationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const application = await applicationService.updateApplicationStatus(
      Number(req.params.id),
      req.user!.id,
      req.body.status as ApplicationStatus
    );
    res.status(200).json({ data: { application } });
  } catch (error) {
    next(error);
  }
}

async function downloadResume(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resumeUrl = await applicationService.getResumeUrl(
      Number(req.params.id),
      req.user!.id
    );
    res.redirect(resumeUrl);
  } catch (error) {
    next(error);
  }
}

export { applyToJob, getMyApplications, getJobApplicants, updateApplicationStatus, downloadResume };
