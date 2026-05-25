import { Request, Response, NextFunction } from 'express';
import * as followService from '../services/follow.service';

async function followCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const follow = await followService.followCompany(req.user!.id, Number(req.params.id));
    res.status(201).json({ data: { follow } });
  } catch (error) {
    next(error);
  }
}

async function unfollowCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await followService.unfollowCompany(req.user!.id, Number(req.params.id));
    res.status(200).json({ data: { message: 'Unfollowed successfully' } });
  } catch (error) {
    next(error);
  }
}

async function getFollowerCount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await followService.getFollowerCount(Number(req.params.id));
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

async function getFollowedCompanies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const companies = await followService.getFollowedCompanies(req.user!.id);
    res.status(200).json({ data: { companies } });
  } catch (error) {
    next(error);
  }
}

export { followCompany, unfollowCompany, getFollowerCount, getFollowedCompanies };
