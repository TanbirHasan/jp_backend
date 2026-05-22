import { Request, Response, NextFunction } from 'express';
import * as alertService from '../services/alert.service';
import { JobType } from '../types';

async function createAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const alert = await alertService.createAlert(req.user!.id, {
      keywords: req.body.keywords,
      job_type: req.body.job_type as JobType | undefined,
      location: req.body.location,
    });
    res.status(201).json({ data: { alert } });
  } catch (error) {
    next(error);
  }
}

async function getMyAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const alerts = await alertService.getMyAlerts(req.user!.id);
    res.status(200).json({ data: { alerts } });
  } catch (error) {
    next(error);
  }
}

async function deleteAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await alertService.deleteAlert(Number(req.params.id), req.user!.id);
    res.status(200).json({ data: { message: 'Alert deleted successfully' } });
  } catch (error) {
    next(error);
  }
}

export { createAlert, getMyAlerts, deleteAlert };
