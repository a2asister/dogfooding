import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { TokenPayload } from '../types';

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload as object, config.jwtSecret as jwt.Secret, { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, config.bcryptSaltRounds);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function parseDevice(userAgent: string): string {
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    return 'Mobile';
  }
  if (/Windows/i.test(userAgent)) {
    return 'Windows';
  }
  if (/Macintosh|Mac OS X/i.test(userAgent)) {
    return 'macOS';
  }
  if (/Linux/i.test(userAgent)) {
    return 'Linux';
  }
  return 'Unknown';
}

export function success(data: unknown = null, message = 'success') {
  return { code: 0, data, message };
}

export function error(message = 'error', code = 1) {
  return { code, data: null, message };
}
