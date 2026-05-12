import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';

async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await userService.findAllUsers();
    res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
}

async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.findMe(req.user!.id);
    res.status(200).json({ data: { user } });
  } catch (error) {
    next(error);
  }
}

export { getUsers, getMe };
