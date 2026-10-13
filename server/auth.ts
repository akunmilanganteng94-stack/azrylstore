import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { getDb } from './db.ts';

const JWT_SECRET = process.env.SESSION_SECRET || 'azryl-store-super-secret-key-2026-production';
const JWT_EXPIRES_IN = '24h';

export interface TokenPayload {
  adminId: string;
  username: string;
}

// In-memory rate limiter for login
interface RateLimitEntry {
  attempts: number;
  blockedUntil: number;
}
const loginAttempts = new Map<string, RateLimitEntry>();

export function checkLoginRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry) return { allowed: true };

  if (entry.blockedUntil > now) {
    const waitSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  // Reset if window has passed
  if (entry.blockedUntil !== 0 && entry.blockedUntil <= now) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(ip: string) {
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { attempts: 0, blockedUntil: 0 };
  entry.attempts += 1;

  if (entry.attempts >= 5) {
    entry.blockedUntil = now + 15 * 60 * 1000; // 15 minutes block
  }
  loginAttempts.set(ip, entry);
}

export function recordSuccessfulLogin(ip: string) {
  loginAttempts.delete(ip);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.azryl_admin_token) {
    token = req.cookies.azryl_admin_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Autentikasi diperlukan.' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized: Sesi tidak valid atau telah berakhir.' });
  }

  const db = await getDb();
  const result = db.exec("SELECT id, username FROM admins WHERE id = '" + payload.adminId.replace(/'/g, "''") + "'");
  if (!result || result.length === 0 || result[0].values.length === 0) {
    return res.status(401).json({ error: 'Unauthorized: Akun admin tidak ditemukan.' });
  }

  (req as any).admin = {
    id: result[0].values[0][0],
    username: result[0].values[0][1]
  };

  next();
}
