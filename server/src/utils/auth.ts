import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config';
import { AuthPayload } from '../types';

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret) as AuthPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function successResponse(data?: any, message = 'success'): { code: number; message: string; data?: any } {
  return { code: 0, message, data };
}

export function errorResponse(message: string, code = 1): { code: number; message: string } {
  return { code, message };
}
