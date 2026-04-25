import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS } from '../constants';
import type { OperationLog, UserRole } from '../types';

export class StorageService {
  static get<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static set<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }

  static generateId(): string {
    return uuidv4();
  }

  static getNow(): string {
    return new Date().toISOString();
  }

  static getAll<T>(key: string): T[] {
    return this.get<T[]>(key) || [];
  }

  static saveAll<T>(key: string, items: T[]): void {
    this.set(key, items);
  }

  static findById<T extends { id: string }>(key: string, id: string): T | undefined {
    const items = this.getAll<T>(key);
    return items.find((item) => item.id === id);
  }

  static create<T extends { id: string; createdAt: string; updatedAt: string }>(
    key: string,
    item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): T {
    const items = this.getAll<T>(key);
    const newItem = {
      ...item,
      id: this.generateId(),
      createdAt: this.getNow(),
      updatedAt: this.getNow(),
    } as T;
    items.push(newItem);
    this.saveAll(key, items);
    return newItem;
  }

  static update<T extends { id: string; updatedAt: string }>(
    key: string,
    id: string,
    updates: Partial<Omit<T, 'id' | 'createdAt'>>
  ): T | null {
    const items = this.getAll<T>(key);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: this.getNow(),
    } as T;
    this.saveAll(key, items);
    return items[index];
  }

  static delete(key: string, id: string): boolean {
    const items = this.getAll<{ id: string }>(key);
    const newItems = items.filter((item) => item.id !== id);
    this.saveAll(key, newItems);
    return newItems.length < items.length;
  }

  static logOperation(
    userId: string,
    userName: string,
    userRole: UserRole,
    module: string,
    action: string,
    targetType: string,
    targetId?: string,
    details?: string
  ): void {
    const logs = this.getAll<OperationLog>(STORAGE_KEYS.OPERATION_LOGS);
    const newLog: OperationLog = {
      id: this.generateId(),
      userId,
      userName,
      userRole,
      module,
      action,
      targetType,
      targetId,
      details,
      createdAt: this.getNow(),
    };
    logs.push(newLog);
    this.saveAll(STORAGE_KEYS.OPERATION_LOGS, logs);
  }
}
