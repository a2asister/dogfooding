import { db } from '../database/init';

export function logOperation(userId: number, operation: string, module: string, ip?: string): void {
  db.prepare(
    'INSERT INTO operation_logs (user_id, operation, module, ip) VALUES (?, ?, ?, ?)'
  ).run(userId, operation, module, ip);
}
