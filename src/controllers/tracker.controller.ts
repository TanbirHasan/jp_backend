import { Request, Response, NextFunction } from 'express';
import * as trackerService from '../services/tracker.service';
import { TrackerFilters, TrackerStatus } from '../types';

async function createEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const entry = await trackerService.createEntry(req.user!.id, req.body);
    res.status(201).json({ data: { entry } });
  } catch (error) {
    next(error);
  }
}

async function getAllEntries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters: TrackerFilters = {
      status:   req.query.status   as TrackerStatus | undefined,
      platform: req.query.platform as string | undefined,
      sort:     req.query.sort     as TrackerFilters['sort'],
      order:    req.query.order    as 'asc' | 'desc' | undefined,
    };
    const entries = await trackerService.getAllEntries(req.user!.id, filters);
    res.status(200).json({ data: { entries } });
  } catch (error) {
    next(error);
  }
}

async function getEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const entry = await trackerService.getEntry(Number(req.params.id), req.user!.id);
    res.status(200).json({ data: { entry } });
  } catch (error) {
    next(error);
  }
}

async function updateEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const entry = await trackerService.updateEntry(Number(req.params.id), req.user!.id, req.body);
    res.status(200).json({ data: { entry } });
  } catch (error) {
    next(error);
  }
}

async function deleteEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await trackerService.deleteEntry(Number(req.params.id), req.user!.id);
    res.status(200).json({ data: { message: 'Entry deleted successfully' } });
  } catch (error) {
    next(error);
  }
}

export { createEntry, getAllEntries, getEntry, updateEntry, deleteEntry };
