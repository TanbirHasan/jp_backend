import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../types';

function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = (result.error as ZodError).issues.map((e) => e.message).join(', ');
      return next(new AppError(message, 400));
    }
    req.body = result.data;
    next();
  };
}

export { validate };
