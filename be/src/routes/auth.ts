import { Router } from 'express';
import crypto from 'crypto';
import { issueToken } from '../lib/token';

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// POST /api/auth/login — exchange the admin password for a 7-day token.
router.post('/login', (req, res) => {
  const { password } = req.body ?? {};

  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ message: 'Server is missing ADMIN_PASSWORD configuration' });
  }
  if (typeof password !== 'string' || !safeEqual(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ message: 'Incorrect password' });
  }

  res.json({ token: issueToken() });
});

export default router;
