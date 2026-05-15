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

  private deleteRecursive(nodeId: number): void {
    const children = db.prepare('SELECT id FROM nodes WHERE parent_id = ?').all(nodeId) as FileNode[];
    for (const child of children) {
      this.deleteRecursive(child.id);
    }
    db.prepare('DELETE FROM nodes WHERE id = ?').run(nodeId);
  }

  delete(path: string, recursive: boolean = false): boolean {
    const resolved = this.resolvePath(path);
    if (resolved === '/') return false;
    
    const nodeId = this.getNodeId(resolved);
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

  writeFile(path: string, content: string): boolean {
    const resolved = this.resolvePath(path);
    const nodeId = this.getNodeId(resolved);
    
    if (nodeId !== null) {
      const node = this.getNodeById(nodeId);
      if (node?.type === 'file') {
        const result = db.prepare('UPDATE nodes SET content = ? WHERE id = ?').run(content, nodeId);
        return result.changes > 0;
      }
      return false;
    }
    
    return this.createFile(path, content);
  }

  copy(source: string, destination: string): boolean {
    const resolvedSource = this.resolvePath(source);
    const resolvedDest = this.resolvePath(destination);
    
    const sourceId = this.getNodeId(resolvedSource);
    if (sourceId === null) return false;
    
    const sourceNode = this.getNodeById(sourceId);
    if (sourceNode === null) return false;
    
    const destParentPath = resolvedDest.substring(0, resolvedDest.lastIndexOf('/')) || '/';
    const destName = resolvedDest.substring(resolvedDest.lastIndexOf('/') + 1);
    
    const destParentId = this.getNodeId(destParentPath);
    if (destParentId === null) return false;
    
    const destId = this.getNodeId(resolvedDest);
    if (destId !== null) {
      const destNode = this.getNodeById(destId);
      if (destNode?.type === 'dir') {
        return this.copyToDirectory(sourceId, destId, sourceNode.name);
      }
      return false;
    }
    
    if (sourceNode.type === 'file') {
      const result = db.prepare('INSERT INTO nodes (name, type, parent_id, content) VALUES (?, ?, ?, ?)').run(destName, 'file', destParentId, sourceNode.content);
      return result.changes > 0;
    }
    
    return this.copyDirectoryRecursive(sourceId, destParentId, destName);
  }

  private copyToDirectory(sourceId: number, destDirId: number, name: string): boolean {
    const sourceNode = this.getNodeById(sourceId);
    if (sourceNode === null) return false;
    
    const existing = db.prepare('SELECT id FROM nodes WHERE parent_id = ? AND name = ?').get(destDirId, name) as FileNode | undefined;
    if (existing !== undefined) return false;
    
    if (sourceNode.type === 'file') {
      const result = db.prepare('INSERT INTO nodes (name, type, parent_id, content) VALUES (?, ?, ?, ?)').run(name, 'file', destDirId, sourceNode.content);
      return result.changes > 0;
    }
    
    return this.copyDirectoryRecursive(sourceId, destDirId, name);
  }

  private copyDirectoryRecursive(sourceDirId: number, destParentId: number, newName: string): boolean {
    const result = db.prepare('INSERT INTO nodes (name, type, parent_id) VALUES (?, ?, ?)').run(newName, 'dir', destParentId);
    if (result.changes === 0) return false;
    
    const newDirId = Number(result.lastInsertRowid);
    const children = db.prepare('SELECT id, name, type, content FROM nodes WHERE parent_id = ?').all(sourceDirId) as FileNode[];
    
    for (const child of children) {
      if (child.type === 'file') {
        db.prepare('INSERT INTO nodes (name, type, parent_id, content) VALUES (?, ?, ?, ?)').run(child.name, 'file', newDirId, child.content);
      } else {
        this.copyDirectoryRecursive(child.id, newDirId, child.name);
      }
    }
    
    return true;
  }

  move(source: string, destination: string): boolean {
    const resolvedSource = this.resolvePath(source);
    const resolvedDest = this.resolvePath(destination);
    
    if (resolvedSource === '/') return false;
    
    const sourceId = this.getNodeId(resolvedSource);
    if (sourceId === null) return false;
    
    const destId = this.getNodeId(resolvedDest);
    
    if (destId !== null) {
      const destNode = this.getNodeById(destId);
      if (destNode?.type === 'dir') {
        const sourceName = resolvedSource.substring(resolvedSource.lastIndexOf('/') + 1);
        const existing = db.prepare('SELECT id FROM nodes WHERE parent_id = ? AND name = ?').get(destId, sourceName) as FileNode | undefined;
        if (existing !== undefined) return false;
        const result = db.prepare('UPDATE nodes SET parent_id = ? WHERE id = ?').run(destId, sourceId);
        return result.changes > 0;
      }
      return false;
    }
    
    const destParentPath = resolvedDest.substring(0, resolvedDest.lastIndexOf('/')) || '/';
    const destName = resolvedDest.substring(resolvedDest.lastIndexOf('/') + 1);
    
    const destParentId = this.getNodeId(destParentPath);
    if (destParentId === null) return false;
    
    const result = db.prepare('UPDATE nodes SET parent_id = ?, name = ? WHERE id = ?').run(destParentId, destName, sourceId);
    return result.changes > 0;
  }

  getNodeInfo(path: string): { name: string; type: string; size: number; created_at: string } | null {
    const resolved = this.resolvePath(path);
    const nodeId = this.getNodeId(resolved);
    if (nodeId === null) return null;
    
    const node = this.getNodeById(nodeId);
    if (node === null) return null;
    
    return {
      name: node.name,
      type: node.type,
      size: node.content?.length || 0,
      created_at: node.created_at,
    };
  }
}

export const fs = new FileSystem();
