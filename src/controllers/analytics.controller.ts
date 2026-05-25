import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service';

async function getEmployerStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await analyticsService.getEmployerStats(req.user!.id);
    res.status(200).json({ data: stats });
  } catch (error) {
    next(error);
  }
}

export { getEmployerStats };
