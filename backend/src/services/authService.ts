import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthPayload } from '../types';
import { JsonStorage } from '../utils/jsonStorage';

export class AuthService {
  private storage: JsonStorage;
  private jwtSecret: string;

  constructor(storage: JsonStorage, jwtSecret: string) {
    this.storage = storage;
    this.jwtSecret = jwtSecret;
  }

  public async register(username: string, password: string, role: User['role'] = 'user'): Promise<User> {
    const existingUser = this.storage.getUserByUsername(username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user: User = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      role,
      permissions: role === 'admin' 
        ? ['read:all', 'write:all', 'delete:all', 'admin:all']
        : ['read:own', 'write:own'],
      createdAt: new Date().toISOString()
    };

    const users = this.storage.getUsers();
    users.push(user);
    this.storage.saveUsers(users);

    return user;
  }

  public async login(username: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const user = this.storage.getUserByUsername(username);
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('用户名或密码错误');
    }

    const payload: AuthPayload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  public verifyToken(token: string): AuthPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as AuthPayload;
    } catch (error) {
      throw new Error('无效的令牌');
    }
  }

  public getUserById(id: string): Omit<User, 'password'> | undefined {
    const user = this.storage.getUserById(id);
    if (!user) return undefined;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  public getAllUsers(): Omit<User, 'password'>[] {
    return this.storage.getUsers().map(({ password: _, ...user }) => user);
  }

  public hasPermission(userId: string, permission: string): boolean {
    const user = this.storage.getUserById(userId);
    if (!user) return false;
    
    if (user.role === 'admin') {
      return true;
    }
    
    return user.permissions.includes(permission);
  }

  public canReadDocument(userId: string, document: any): boolean {
    const user = this.storage.getUserById(userId);
    if (!user) return false;
    
    if (user.role === 'admin') {
      return true;
    }
    
    if (document.ownerId === userId) {
      return true;
    }
    
    return document.readPermissions.includes(userId) || document.readPermissions.includes(user.role);
  }

  public canWriteDocument(userId: string, document: any): boolean {
    const user = this.storage.getUserById(userId);
    if (!user) return false;
    
    if (user.role === 'admin') {
      return true;
    }
    
    if (document.ownerId === userId) {
      return true;
    }
    
    return document.writePermissions.includes(userId) || document.writePermissions.includes(user.role);
  }
}
