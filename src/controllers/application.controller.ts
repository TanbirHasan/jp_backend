import { Request, Response, NextFunction } from 'express';
import * as applicationService from '../services/application.service';
import { uploadResumeToCloudinary } from '../config/cloudinary';
import { ApplicationStatus, AppError } from '../types';

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

    // Fetch the file from Cloudinary server-to-server, then stream it to the client.
    // This avoids CORS issues that occur when the frontend fetch follows a cross-origin redirect.
    const fileResponse = await fetch(resumeUrl);
    if (!fileResponse.ok || !fileResponse.body) {
      return next(new AppError('Resume file could not be retrieved', 404));
    }

    const contentType = fileResponse.headers.get('content-type') ?? 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');

    const buffer = await fileResponse.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    next(error);
  }
}

export { applyToJob, getMyApplications, getJobApplicants, updateApplicationStatus, downloadResume };
