import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AppError } from '../types';

function notFound(req: Request, res: Response, next: NextFunction): void {
  next(new AppError(`Not found - ${req.originalUrl}`, 404));
}

function errorHandler(error: AppError | Error, req: Request, res: Response, next: NextFunction): void {
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : error.message;
    res.status(400).json({ message });
    return;
  }

  const statusCode = (error as AppError).statusCode || 500;
  res.status(statusCode).json({
    message: error.message || 'Internal server error',
  });
}

export { notFound, errorHandler };
