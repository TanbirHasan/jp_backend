import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

function notFound(req: Request, res: Response, next: NextFunction): void {
  next(new AppError(`Not found - ${req.originalUrl}`, 404));
}

function errorHandler(error: AppError | Error, req: Request, res: Response, next: NextFunction): void {
  const statusCode = (error as AppError).statusCode || 500;
  res.status(statusCode).json({
    message: error.message || 'Internal server error',
  });
}

export { notFound, errorHandler };
