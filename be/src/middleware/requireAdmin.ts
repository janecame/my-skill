import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/token';

// Protects write routes: requires a valid admin token in the Authorization header.
// GET routes stay public so visitors can view everything.
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!verifyToken(token)) {
    return res.status(401).json({ message: 'Unauthorized — admin access required' });
  }

  next();
}
