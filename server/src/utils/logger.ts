import db from '../db';

interface LogParams {
  userId?: number;
  username?: string;
  operation: string;
  module?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export function logOperation(params: LogParams) {
  const stmt = db.prepare(`
    INSERT INTO operation_logs 
    (user_id, username, operation, module, details, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    params.userId ?? null,
    params.username ?? null,
    params.operation,
    params.module ?? null,
    params.details ?? null,
    params.ipAddress ?? null,
    params.userAgent ?? null
  );
}
