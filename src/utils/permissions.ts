import { db } from '../store/database';
import { generateId } from './helpers';
import { OperationLog } from '../types';

export async function logOperation(
  tableId: string,
  userId: string,
  operation: string,
  details: string
): Promise<void> {
  const log: OperationLog = {
    id: generateId(),
    tableId,
    userId,
    operation,
    details,
    timestamp: Date.now()
  };
  
  try {
    await db.logs.put(log);
  } catch (error) {
    console.error('记录操作日志失败:', error);
  }
}

export async function getOperationLogs(
  tableId: string,
  limit: number = 100
): Promise<OperationLog[]> {
  try {
    return await db.logs
      .where('tableId')
      .equals(tableId)
      .reverse()
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error('获取操作日志失败:', error);
    return [];
  }
}

export enum PermissionLevel {
  READ_ONLY = 'read_only',
  EDIT = 'edit',
  ADMIN = 'admin'
}

export interface CellPermission {
  row: number;
  col: number;
  level: PermissionLevel;
  userId?: string;
}

export const CellPermissions = {
  cache: new Map<string, PermissionLevel>(),

  set(row: number, col: number, level: PermissionLevel, userId?: string): void {
    const key = `${row}-${col}`;
    this.cache.set(key, level);
    void logOperation(
      'default_spreadsheet',
      userId || 'unknown',
      '设置单元格权限',
      `单元格 (${row}, ${col}) 权限设置为 ${level}`
    );
  },

  get(row: number, col: number): PermissionLevel {
    const key = `${row}-${col}`;
    return this.cache.get(key) || PermissionLevel.EDIT;
  },

  canEdit(row: number, col: number): boolean {
    const permission = this.get(row, col);
    return permission === PermissionLevel.EDIT || permission === PermissionLevel.ADMIN;
  },

  setColumnReadOnly(colIndex: number, readOnly: boolean = true): void {
    const level = readOnly ? PermissionLevel.READ_ONLY : PermissionLevel.EDIT;
    for (let row = 0; row < 1000; row++) {
      this.set(row, colIndex, level);
    }
  },

  setRowReadOnly(rowIndex: number, readOnly: boolean = true): void {
    const level = readOnly ? PermissionLevel.READ_ONLY : PermissionLevel.EDIT;
    for (let col = 0; col < 100; col++) {
      this.set(rowIndex, col, level);
    }
  },

  clear(): void {
    this.cache.clear();
  }
};
