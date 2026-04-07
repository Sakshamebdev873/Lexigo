import { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  console.error('[unhandled]', err);
  return res.status(500).json({ error: 'Internal server error' });
};

// Bonus: simple role gate using x-role header (Admin | Intern)
export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  const role = (req.header('x-role') || 'Intern').toLowerCase();
  if (role !== 'admin') {
    return next(new HttpError(403, 'Admin role required for this action'));
  }
  next();
};
