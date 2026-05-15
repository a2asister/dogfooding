import db, { type FileNode, getTeamMembers, type Team, getUserById } from './db';
import { v4 as uuidv4 } from 'uuid';

export type ContextType = 'user' | 'team';

export interface FileSystemContext {
  type: ContextType;
  id: number;
}

export class FileSystem {
  private currentPaths: Map<string, string> = new Map();

  private getContextKey(context: FileSystemContext): string {
    return `${context.type}:${context.id}`;
  }

  private getRootId(context: FileSystemContext): number | null {
    let row: FileNode | undefined;
    if (context.type === 'user') {
      row = db.prepare('SELECT id FROM nodes WHERE parent_id IS NULL AND name = \'/\' AND owner_id = ?').get(context.id) as FileNode | undefined;
    } else {
      row = db.prepare('SELECT id FROM nodes WHERE parent_id IS NULL AND name = \'/\' AND team_id = ?').get(context.id) as FileNode | undefined;
    }
    return row?.id ?? null;
  }

  private getNodeId(context: FileSystemContext, path: string): number | null {
    const rootId = this.getRootId(context);
    if (rootId === null) return null;
    
    if (path === '/') {
      return rootId;
    }

    const parts = path.split('/').filter(Boolean);
    let currentId: number = rootId;

    for (const part of parts) {
      const node = db.prepare('SELECT id, type FROM nodes WHERE parent_id = ? AND name = ?').get(currentId, part) as FileNode | undefined;
      if (node === undefined) return null;
      currentId = node.id;
    }
    return currentId;
  }

  private getNodeById(id: number): FileNode | null {
    const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id) as FileNode | undefined;
    return node ?? null;
  }

  private resolvePath(currentPath: string, pathStr: string): string {
    if (pathStr.startsWith('/')) {
      return this.normalizePath(pathStr);
    }
    return this.normalizePath(this.joinPath(currentPath, pathStr));
  }

  private normalizePath(pathStr: string): string {
    const parts = pathStr.split('/').filter(Boolean);
    const result: string[] = [];
    
    for (const part of parts) {
      if (part === '..') {
        result.pop();
      } else if (part !== '.') {
        result.push(part);
      }
    }
    
    return '/' + result.join('/');
  }

  private joinPath(a: string, b: string): string {
    return a + (a.endsWith('/') ? '' : '/') + b;
  }

  getCurrentPath(context: FileSystemContext): string {
    const key = this.getContextKey(context);
    return this.currentPaths.get(key) || '/';
  }

  setCurrentPath(context: FileSystemContext, path: string): boolean {
    const currentPath = this.getCurrentPath(context);
    const resolved = this.resolvePath(currentPath, path);
    const nodeId = this.getNodeId(context, resolved);
    if (nodeId === null) return false;
    
    const node = this.getNodeById(nodeId);
    if (node === null || node.type !== 'dir') return false;
    
    const key = this.getContextKey(context);
    this.currentPaths.set(key, resolved);
    return true;
  }

  listDirectory(context: FileSystemContext, path?: string): { name: string; type: string; uuid: string }[] {
    const currentPath = this.getCurrentPath(context);
    const targetPath = path !== undefined ? this.resolvePath(currentPath, path) : currentPath;
    const dirId = this.getNodeId(context, targetPath);
    if (dirId === null) return [];

    const nodes = db.prepare('SELECT name, type, uuid FROM nodes WHERE parent_id = ? ORDER BY type, name').all(dirId) as (FileNode & { uuid: string })[];
    return nodes.map(n => ({ name: n.name, type: n.type, uuid: n.uuid }));
  }

  createDirectory(context: FileSystemContext, path: string): boolean {
    const currentPath = this.getCurrentPath(context);
    const resolved = this.resolvePath(currentPath, path);
    if (resolved === '/') return false;
    
    const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const dirName = resolved.substring(resolved.lastIndexOf('/') + 1);
    
    const parentId = this.getNodeId(context, parentPath);
    if (parentId === null) return false;
    
    const existing = db.prepare('SELECT id FROM nodes WHERE parent_id = ? AND name = ?').get(parentId, dirName) as FileNode | undefined;
    if (existing !== undefined) return false;
    
    const uuid = uuidv4();
    const result = db.prepare(`
      INSERT INTO nodes (uuid, name, type, parent_id, owner_id, team_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uuid,
      dirName,
      'dir',
      parentId,
      context.type === 'user' ? context.id : null,
      context.type === 'team' ? context.id : null
    );
    return result.changes > 0;
  }

  createFile(context: FileSystemContext, path: string, content: string = ''): boolean {
    const currentPath = this.getCurrentPath(context);
    const resolved = this.resolvePath(currentPath, path);
    const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const fileName = resolved.substring(resolved.lastIndexOf('/') + 1);
    
    if (fileName === '') return false;
    
    const parentId = this.getNodeId(context, parentPath);
    if (parentId === null) return false;
    
    const existing = db.prepare('SELECT id FROM nodes WHERE parent_id = ? AND name = ?').get(parentId, fileName) as FileNode | undefined;
    if (existing !== undefined) return false;
    
    const uuid = uuidv4();
    const result = db.prepare(`
      INSERT INTO nodes (uuid, name, type, parent_id, content, owner_id, team_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      uuid,
      fileName,
      'file',
      parentId,
      content,
      context.type === 'user' ? context.id : null,
      context.type === 'team' ? context.id : null
    );
    return result.changes > 0;
  }

  readFile(context: FileSystemContext, path: string): string | null {
    const currentPath = this.getCurrentPath(context);
    const resolved = this.resolvePath(currentPath, path);
    const fileId = this.getNodeId(context, resolved);
    if (fileId === null) return null;
    
    const node = this.getNodeById(fileId);
    if (node === null || node.type !== 'file') return null;
    
    return node.content;
  }

  exists(context: FileSystemContext, path: string): boolean {
    const currentPath = this.getCurrentPath(context);
    const resolved = this.resolvePath(currentPath, path);
    return this.getNodeId(context, resolved) !== null;
  }

  getType(context: FileSystemContext, path: string): 'file' | 'dir' | null {
    const currentPath = this.getCurrentPath(context);
    const resolved = this.resolvePath(currentPath, path);
    const nodeId = this.getNodeId(context, resolved);
    if (nodeId === null) return null;
    
    const node = this.getNodeById(nodeId);
    return node?.type ?? null;
  }

  private deleteRecursive(nodeId: number): void {
    const children = db.prepare('SELECT id FROM nodes WHERE parent_id = ?').all(nodeId) as FileNode[];
    for (const child of children) {
      this.deleteRecursive(child.id);
    }
    db.prepare('DELETE FROM nodes WHERE id = ?').run(nodeId);
  }

  delete(context: FileSystemContext, path: string, recursive: boolean = false): boolean {
    const currentPath = this.getCurrentPath(context);
    const resolved = this.resolvePath(currentPath, path);
    if (resolved === '/') return false;
    
    const nodeId = this.getNodeId(context, resolved);
    if (nodeId === null) return false;
    
    const node = this.getNodeById(nodeId);
    if (node === null) return false;
    
    if (node.type === 'dir') {
      const children = db.prepare('SELECT id FROM nodes WHERE parent_id = ?').all(nodeId) as FileNode[];
      if (children.length > 0 && !recursive) {
        return false;
      }
      this.deleteRecursive(nodeId);
    } else {
      db.prepare('DELETE FROM nodes WHERE id = ?').run(nodeId);
    }
    
    return true;
  }

  writeFile(context: FileSystemContext, path: string, content: string): boolean {
    const currentPath = this.getCurrentPath(context);
    const resolved = this.resolvePath(currentPath, path);
    const nodeId = this.getNodeId(context, resolved);
    
    if (nodeId !== null) {
      const node = this.getNodeById(nodeId);
      if (node?.type === 'file') {
        const result = db.prepare('UPDATE nodes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(content, nodeId);
        return result.changes > 0;
      }
      return false;
    }
    
    return this.createFile(context, path, content);
  }

  copy(context: FileSystemContext, source: string, destination: string): boolean {
    const currentPath = this.getCurrentPath(context);
    const resolvedSource = this.resolvePath(currentPath, source);
    const resolvedDest = this.resolvePath(currentPath, destination);
    
    const sourceId = this.getNodeId(context, resolvedSource);
    if (sourceId === null) return false;
    
    const sourceNode = this.getNodeById(sourceId);
    if (sourceNode === null) return false;
    
    const destParentPath = resolvedDest.substring(0, resolvedDest.lastIndexOf('/')) || '/';
    const destName = resolvedDest.substring(resolvedDest.lastIndexOf('/') + 1);
    
    const destParentId = this.getNodeId(context, destParentPath);
    if (destParentId === null) return false;
    
    const destId = this.getNodeId(context, resolvedDest);
    if (destId !== null) {
      const destNode = this.getNodeById(destId);
      if (destNode?.type === 'dir') {
        return this.copyToDirectory(context, sourceId, destId, sourceNode.name);
      }
      return false;
    }
    
    if (sourceNode.type === 'file') {
      const uuid = uuidv4();
      const result = db.prepare(`
        INSERT INTO nodes (uuid, name, type, parent_id, content, owner_id, team_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuid,
        destName,
        'file',
        destParentId,
        sourceNode.content,
        context.type === 'user' ? context.id : null,
        context.type === 'team' ? context.id : null
      );
      return result.changes > 0;
    }
    
    return this.copyDirectoryRecursive(context, sourceId, destParentId, destName);
  }

  private copyToDirectory(context: FileSystemContext, sourceId: number, destDirId: number, name: string): boolean {
    const sourceNode = this.getNodeById(sourceId);
    if (sourceNode === null) return false;
    
    const existing = db.prepare('SELECT id FROM nodes WHERE parent_id = ? AND name = ?').get(destDirId, name) as FileNode | undefined;
    if (existing !== undefined) return false;
    
    if (sourceNode.type === 'file') {
      const uuid = uuidv4();
      const result = db.prepare(`
        INSERT INTO nodes (uuid, name, type, parent_id, content, owner_id, team_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuid,
        name,
        'file',
        destDirId,
        sourceNode.content,
        context.type === 'user' ? context.id : null,
        context.type === 'team' ? context.id : null
      );
      return result.changes > 0;
    }
    
    return this.copyDirectoryRecursive(context, sourceId, destDirId, name);
  }

  private copyDirectoryRecursive(context: FileSystemContext, sourceDirId: number, destParentId: number, newName: string): boolean {
    const uuid = uuidv4();
    const result = db.prepare(`
      INSERT INTO nodes (uuid, name, type, parent_id, owner_id, team_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uuid,
      newName,
      'dir',
      destParentId,
      context.type === 'user' ? context.id : null,
      context.type === 'team' ? context.id : null
    );
    if (result.changes === 0) return false;
    
    const newDirId = Number(result.lastInsertRowid);
    const children = db.prepare('SELECT id, name, type, content FROM nodes WHERE parent_id = ?').all(sourceDirId) as FileNode[];
    
    for (const child of children) {
      if (child.type === 'file') {
        const childUuid = uuidv4();
        db.prepare(`
          INSERT INTO nodes (uuid, name, type, parent_id, content, owner_id, team_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          childUuid,
          child.name,
          'file',
          newDirId,
          child.content,
          context.type === 'user' ? context.id : null,
          context.type === 'team' ? context.id : null
        );
      } else {
        this.copyDirectoryRecursive(context, child.id, newDirId, child.name);
      }
    }
    
    return true;
  }

  move(context: FileSystemContext, source: string, destination: string): boolean {
    const currentPath = this.getCurrentPath(context);
    const resolvedSource = this.resolvePath(currentPath, source);
    const resolvedDest = this.resolvePath(currentPath, destination);
    
    if (resolvedSource === '/') return false;
    
    const sourceId = this.getNodeId(context, resolvedSource);
    if (sourceId === null) return false;
    
    const destId = this.getNodeId(context, resolvedDest);
    
    if (destId !== null) {
      const destNode = this.getNodeById(destId);
      if (destNode?.type === 'dir') {
        const sourceName = resolvedSource.substring(resolvedSource.lastIndexOf('/') + 1);
        const existing = db.prepare('SELECT id FROM nodes WHERE parent_id = ? AND name = ?').get(destId, sourceName) as FileNode | undefined;
        if (existing !== undefined) return false;
        const result = db.prepare('UPDATE nodes SET parent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(destId, sourceId);
        return result.changes > 0;
      }
      return false;
    }
    
    const destParentPath = resolvedDest.substring(0, resolvedDest.lastIndexOf('/')) || '/';
    const destName = resolvedDest.substring(resolvedDest.lastIndexOf('/') + 1);
    
    const destParentId = this.getNodeId(context, destParentPath);
    if (destParentId === null) return false;
    
    const result = db.prepare('UPDATE nodes SET parent_id = ?, name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(destParentId, destName, sourceId);
    return result.changes > 0;
  }

  getNodeInfo(context: FileSystemContext, path: string): { name: string; type: string; size: number; created_at: string; updated_at: string; uuid: string } | null {
    const currentPath = this.getCurrentPath(context);
    const resolved = this.resolvePath(currentPath, path);
    const nodeId = this.getNodeId(context, resolved);
    if (nodeId === null) return null;
    
    const node = this.getNodeById(nodeId);
    if (node === null) return null;
    
    return {
      name: node.name,
      type: node.type,
      size: node.content?.length || 0,
      created_at: node.created_at,
      updated_at: node.updated_at,
      uuid: node.uuid,
    };
  }

  getNodeIdByUuid(uuid: string): number | null {
    const node = db.prepare('SELECT id FROM nodes WHERE uuid = ?').get(uuid) as { id: number } | undefined;
    return node?.id ?? null;
  }

  getNodeByUuid(uuid: string): FileNode | null {
    const node = db.prepare('SELECT * FROM nodes WHERE uuid = ?').get(uuid) as FileNode | undefined;
    return node ?? null;
  }

  getNodeById(id: number): FileNode | null {
    const node = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id) as FileNode | undefined;
    return node ?? null;
  }

  getNode(context: FileSystemContext, path: string): FileNode | null {
    const currentPath = this.getCurrentPath(context);
    const resolvedPath = this.resolvePath(currentPath, path);
    const nodeId = this.getNodeId(context, resolvedPath);
    if (nodeId === null) return null;
    return this.getNodeById(nodeId);
  }

  hasAccess(userId: number, nodeId: number): boolean {
    const node = this.getNodeById(nodeId);
    if (!node) return false;
    
    if (node.owner_id === userId) return true;
    if (node.is_public) return true;
    
    if (node.team_id) {
      const members = getTeamMembers(node.team_id);
      return members.some(m => m.user_id === userId);
    }
    
    return false;
  }

  canEdit(userId: number, nodeId: number): boolean {
    const node = this.getNodeById(nodeId);
    if (!node) return false;
    
    if (node.owner_id === userId) return true;
    
    if (node.team_id) {
      const members = getTeamMembers(node.team_id);
      const member = members.find(m => m.user_id === userId);
      if (member && (member.role === 'admin' || member.role === 'member')) {
        return true;
      }
    }
    
    return false;
  }

  exportData(context: FileSystemContext): { nodes: FileNode[] } {
    let nodes: FileNode[];
    if (context.type === 'user') {
      nodes = db.prepare('SELECT * FROM nodes WHERE owner_id = ?').all(context.id) as FileNode[];
    } else {
      nodes = db.prepare('SELECT * FROM nodes WHERE team_id = ?').all(context.id) as FileNode[];
    }
    return { nodes };
  }

  importData(context: FileSystemContext, data: { nodes: FileNode[] }): boolean {
    try {
      for (const node of data.nodes) {
        if (node.type === 'dir') {
          const uuid = uuidv4();
          db.prepare(`
            INSERT INTO nodes (uuid, name, type, parent_id, owner_id, team_id)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            uuid,
            node.name,
            'dir',
            node.parent_id,
            context.type === 'user' ? context.id : null,
            context.type === 'team' ? context.id : null
          );
        } else {
          const uuid = uuidv4();
          db.prepare(`
            INSERT INTO nodes (uuid, name, type, parent_id, content, owner_id, team_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(
            uuid,
            node.name,
            'file',
            node.parent_id,
            node.content,
            context.type === 'user' ? context.id : null,
            context.type === 'team' ? context.id : null
          );
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  setPublic(nodeId: number, isPublic: boolean): boolean {
    const result = db.prepare('UPDATE nodes SET is_public = ? WHERE id = ?').run(isPublic ? 1 : 0, nodeId);
    return result.changes > 0;
  }
}

export const fs = new FileSystem();
