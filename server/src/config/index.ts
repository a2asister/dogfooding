import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'hospital-management-system-secret-key',
  tokenExpiresIn: process.env.TOKEN_EXPIRES_IN || '7d',
  dbPath: process.env.DB_PATH || './data/hospital.db',
  uploadPath: process.env.UPLOAD_PATH || './uploads',
};
