import crypto from 'crypto';

const SECRET = process.env.ADMIN_TOKEN_SECRET || 'dev-insecure-secret-change-me';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function sign(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
}

// Token format: "<expiresAt>.<signature>"
export function issueToken(): string {
  const expiresAt = String(Date.now() + TTL_MS);
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature) return false;

  // Constant-time comparison to avoid timing attacks
  const expected = sign(expiresAt);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  return Date.now() < Number(expiresAt);
}
