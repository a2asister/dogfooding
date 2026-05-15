import db from './db';

interface FileNode {
  id: number;
  name: string;
  type: 'file' | 'dir';
  parent_id: number | null;
  content: string;
  created_at: string;
}

export class FileSystem {
  private currentPath: string = '/';

  private getNodeId(path: string): number | null {
    const root = db.prepare('SELECT id FROM nodes WHERE parent_id IS NULL AND name = \'/\'').get() as FileNode | undefined;
    if (root === undefined) return null;
    
    if (path === '/') {
      return root.id;
    }

    const parts = path.split('/').filter(Boolean);
    let currentId: number = root.id;

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

  private resolvePath(pathStr: string): string {
    if (pathStr.startsWith('/')) {
      return this.normalizePath(pathStr);
    }
    return this.normalizePath(this.joinPath(this.currentPath, pathStr));
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

  getCurrentPath(): string {
    return this.currentPath;
  }

  setCurrentPath(path: string): boolean {
    const resolved = this.resolvePath(path);
    const nodeId = this.getNodeId(resolved);
    if (nodeId === null) return false;
    
    const node = this.getNodeById(nodeId);
    if (node === null || node.type !== 'dir') return false;
    
    this.currentPath = resolved;
    return true;
  }

  listDirectory(path?: string): { name: string; type: string }[] {
    const targetPath = path !== undefined ? this.resolvePath(path) : this.currentPath;
    const dirId = this.getNodeId(targetPath);
    if (dirId === null) return [];

    const nodes = db.prepare('SELECT name, type FROM nodes WHERE parent_id = ? ORDER BY type, name').all(dirId) as FileNode[];
    return nodes.map(n => ({ name: n.name, type: n.type }));
  }

  createDirectory(path: string): boolean {
    const resolved = this.resolvePath(path);
    if (resolved === '/') return false;
    
    const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const dirName = resolved.substring(resolved.lastIndexOf('/') + 1);
    
    const parentId = this.getNodeId(parentPath);
    if (parentId === null) return false;
    
    const existing = db.prepare('SELECT id FROM nodes WHERE parent_id = ? AND name = ?').get(parentId, dirName) as FileNode | undefined;
    if (existing !== undefined) return false;
    
    const result = db.prepare('INSERT INTO nodes (name, type, parent_id) VALUES (?, ?, ?)').run(dirName, 'dir', parentId);
    return result.changes > 0;
  }

  createFile(path: string, content: string = ''): boolean {
    const resolved = this.resolvePath(path);
    const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const fileName = resolved.substring(resolved.lastIndexOf('/') + 1);
    
    if (fileName === '') return false;
    
    const parentId = this.getNodeId(parentPath);
    if (parentId === null) return false;
    
    const existing = db.prepare('SELECT id FROM nodes WHERE parent_id = ? AND name = ?').get(parentId, fileName) as FileNode | undefined;
    if (existing !== undefined) return false;
    
    const result = db.prepare('INSERT INTO nodes (name, type, parent_id, content) VALUES (?, ?, ?, ?)').run(fileName, 'file', parentId, content);
    return result.changes > 0;
  }

  readFile(path: string): string | null {
    const resolved = this.resolvePath(path);
    const fileId = this.getNodeId(resolved);
    if (fileId === null) return null;
    
    const node = this.getNodeById(fileId);
    if (node === null || node.type !== 'file') return null;
    
    return node.content;
  }

  exists(path: string): boolean {
    const resolved = this.resolvePath(path);
    return this.getNodeId(resolved) !== null;
  }

  getType(path: string): 'file' | 'dir' | null {
    const resolved = this.resolvePath(path);
    const nodeId = this.getNodeId(resolved);
    if (nodeId === null) return null;
    
    const node = this.getNodeById(nodeId);
    return node?.type ?? null;
  }
}

export const fs = new FileSystem();
