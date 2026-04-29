import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, { 
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] 
  });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as JwtPayload;
  } catch {
    return null;
  }
};
