import db from '../database/db';
import bcrypt from 'bcryptjs';
import type { AdminUser } from '../types';

export const adminModel = {
  getByUsername(username: string): AdminUser | undefined {
    return db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as AdminUser | undefined;
  },

  verifyPassword(username: string, password: string): boolean {
    const user = this.getByUsername(username);
    if (!user) return false;
    return bcrypt.compareSync(password, user.password_hash);
  },

  getAll(): AdminUser[] {
    return db.prepare('SELECT id, username, role, created_at FROM admin_users ORDER BY id ASC').all() as AdminUser[];
  },

  create(data: { username: string; password: string; role: string }): number {
    const passwordHash = bcrypt.hashSync(data.password, 10);
    const result = db.prepare(`
      INSERT INTO admin_users (username, password_hash, role)
      VALUES (?, ?, ?)
    `).run(data.username, passwordHash, data.role);
    return Number(result.lastInsertRowid);
  }
};
