import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

const REFRESH_TOKEN_COOKIE = 'refresh_token';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions);
    res.status(201).json({ data: { user, accessToken } });
  } catch (error) {
    next(error);
  }
}

async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions);
    res.status(200).json({ data: { user, accessToken } });
  } catch (error) {
    next(error);
  }
}

async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies[REFRESH_TOKEN_COOKIE];
    const { accessToken } = await authService.refresh(token);
    res.status(200).json({ data: { accessToken } });
  } catch (error) {
    next(error);
  }
}

async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies[REFRESH_TOKEN_COOKIE];
    if (token) {
      await authService.logout(token);
    }
    res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);
    res.status(200).json({ data: { message: 'Logged out successfully' } });
  } catch (error) {
    next(error);
  }
}

export { register, login, refresh, logout };
