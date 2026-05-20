import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery, runOneQuery, runQuery } from '../db';
import { config, RBAC_PERMISSIONS, HIGH_RISK_OPERATIONS } from '../config';
import type { User, UserRole } from '../types';
import { auditService } from './audit.service';
import { alertService } from './alert.service';

export const authService = {
  async createUser(
    username: string,
    email: string,
    role: UserRole = 'viewer',
    password?: string,
    githubId?: number
  ): Promise<User> {
    const existingUser = runOneQuery<User>(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existingUser) {
      throw new Error('用户名或邮箱已存在');
    }

    const now = Date.now();
    const id = uuidv4();
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    executeQuery(
      `INSERT INTO users (id, username, email, github_id, role, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, username, email, githubId || null, role, passwordHash, now, now]
    );

    const user = this.getUserById(id);
    if (!user) {
      throw new Error('创建用户失败');
    }

    auditService.log(id, username, 'user:create', 'auth', { username, email, role });
    return user;
  },

  getUserById(id: string): User | null {
    const user = runOneQuery<User>('SELECT * FROM users WHERE id = ?', [id]);
    return user ? this.sanitizeUser(user) : null;
  },

  getUserByGithubId(githubId: number): User | null {
    const user = runOneQuery<User>('SELECT * FROM users WHERE github_id = ?', [githubId]);
    return user ? this.sanitizeUser(user) : null;
  },

  getUserByUsername(username: string): User | null {
    const user = runOneQuery<User>('SELECT * FROM users WHERE username = ?', [username]);
    return user ? this.sanitizeUser(user) : null;
  },

  listUsers(params: { page?: number; pageSize?: number; role?: UserRole }): {
    users: User[];
    total: number;
  } {
    const { page = 1, pageSize = 20, role } = params;
    const where: string[] = [];
    const sqlParams: unknown[] = [];

    if (role) {
      where.push('role = ?');
      sqlParams.push(role);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    const users = runQuery<User>(
      `SELECT * FROM users ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...sqlParams, pageSize, offset]
    ).map(u => this.sanitizeUser(u));

    const countResult = runQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM users ${whereClause}`,
      sqlParams
    );
    const total = countResult[0]?.count || 0;

    return { users, total };
  },

  updateUserRole(userId: string, role: UserRole, operatorId: string, operatorName: string): User | null {
    executeQuery('UPDATE users SET role = ?, updated_at = ? WHERE id = ?', [role, Date.now(), userId]);
    const user = this.getUserById(userId);
    if (user) {
      auditService.log(operatorId, operatorName, 'user:update_role', 'auth', {
        userId,
        oldRole: user.role,
        newRole: role,
      });
    }
    return user;
  },

  updateUserTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresAt: number
  ): void {
    executeQuery(
      'UPDATE users SET access_token = ?, refresh_token = ?, token_expires_at = ?, updated_at = ? WHERE id = ?',
      [accessToken, refreshToken, expiresAt, Date.now(), userId]
    );
  },

  generateToken(user: User): string {
    return (jwt as unknown as { sign: (payload: unknown, secret: string, options: { expiresIn: string }) => string }).sign(
      { id: user.id, username: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  },

  verifyToken(token: string): { id: string; username: string; role: UserRole } | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        username: string;
        role: UserRole;
      };
      return decoded;
    } catch {
      return null;
    }
  },

  checkPermission(userRole: UserRole, resource: string, action: string): boolean {
    const roleConfig = RBAC_PERMISSIONS[userRole];
    if (!roleConfig) return false;

    if (userRole === 'admin') return true;

    for (const perm of roleConfig.permissions) {
      if (perm.resource === '*' || perm.resource === resource) {
        const actions = perm.actions as unknown as string[];
        if (actions.includes('*') || actions.includes(action)) {
          return true;
        }
      }
    }
    return false;
  },

  isHighRiskOperation(operation: string): boolean {
    return (HIGH_RISK_OPERATIONS as unknown as string[]).includes(operation);
  },

  verifyHighRiskPermission(userId: string, operation: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    if (!this.isHighRiskOperation(operation)) return true;
    return user.role === 'admin';
  },

  checkTokenExpiry(): void {
    const now = Date.now();
    const expiredUsers = runQuery<User>(
      'SELECT * FROM users WHERE token_expires_at IS NOT NULL AND token_expires_at < ?',
      [now]
    );

    for (const user of expiredUsers) {
      executeQuery(
        'UPDATE users SET access_token = NULL, refresh_token = NULL, token_expires_at = NULL, updated_at = ? WHERE id = ?',
        [Date.now(), user.id]
      );
      alertService.create(
        'auth_expired',
        'warning',
        `用户 ${user.username} GitHub授权已过期`,
        '用户的GitHub访问令牌已过期，需要重新授权才能继续使用相关功能',
        'auth',
        user.id
      );
    }
  },

  sanitizeUser(user: User): User {
    const { password_hash, ...sanitized } = user as User & { password_hash?: string };
    return sanitized;
  },
};
