import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.join(process.cwd(), 'webcli_filesystem.db');
const db = new Database(dbPath, { timeout: 5000 });

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('temp_store = MEMORY');
db.pragma('mmap_size = 30000000000');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    username TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    theme TEXT DEFAULT 'dark',
    prompt_format TEXT DEFAULT '%user@%host:%path$ ',
    last_sync_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHECK (email IS NOT NULL OR phone IS NOT NULL OR username IS NOT NULL)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'member', 'guest')),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(team_id, user_id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('file', 'dir')),
    parent_id INTEGER,
    content TEXT DEFAULT '',
    owner_id INTEGER,
    team_id INTEGER,
    is_public BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES nodes(id),
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    CHECK (owner_id IS NOT NULL OR team_id IS NOT NULL)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS shares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    node_id INTEGER NOT NULL,
    created_by INTEGER NOT NULL,
    permission TEXT NOT NULL CHECK(permission IN ('read', 'edit')),
    expires_at DATETIME,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (node_id) REFERENCES nodes(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS plugins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    version TEXT NOT NULL,
    author TEXT,
    code TEXT NOT NULL,
    commands TEXT,
    is_public BOOLEAN DEFAULT 1,
    created_by INTEGER,
    download_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE(name, version)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_plugins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plugin_id INTEGER NOT NULL,
    enabled BOOLEAN DEFAULT 1,
    installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (plugin_id) REFERENCES plugins(id),
    UNIQUE(user_id, plugin_id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, key)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_aliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    alias TEXT NOT NULL,
    command TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, alias)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_command_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    command TEXT NOT NULL,
    path TEXT NOT NULL,
    context TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

function initSystemUser(): void {
  const systemUser = db.prepare('SELECT * FROM users WHERE username = ?').get('system') as Record<string, unknown> | undefined;
  if (systemUser === undefined) {
    const passwordHash = bcrypt.hashSync(uuidv4(), 10);
    db.prepare('INSERT INTO users (uuid, username, password_hash) VALUES (?, ?, ?)').run(
      uuidv4(),
      'system',
      passwordHash
    );
  }
}

initSystemUser();

export interface User {
  id: number;
  uuid: string;
  email?: string;
  phone?: string;
  username?: string;
  password_hash: string;
  theme: string;
  prompt_format: string;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  created_by: number;
  created_at: string;
}

export interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  role: 'admin' | 'member' | 'guest';
  joined_at: string;
}

export interface FileNode {
  id: number;
  uuid: string;
  name: string;
  type: 'file' | 'dir';
  parent_id?: number;
  content: string;
  owner_id?: number;
  team_id?: number;
  is_public: number;
  created_at: string;
  updated_at: string;
}

export interface Share {
  id: number;
  uuid: string;
  node_id: number;
  created_by: number;
  permission: 'read' | 'edit';
  expires_at?: string;
  password?: string;
  created_at: string;
}

export interface Plugin {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  version: string;
  author?: string;
  code: string;
  commands?: string;
  is_public: number;
  created_by?: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export function getUserById(id: number): User | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function getUserByUuid(uuid: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE uuid = ?').get(uuid) as User | undefined;
}

export function getUserByEmail(email: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
}

export function getUserByPhone(phone: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as User | undefined;
}

export function getUserByUsername(username: string): User | undefined {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
}

export function createUser(data: {
  email?: string;
  phone?: string;
  username?: string;
  password: string;
}): User {
  const passwordHash = bcrypt.hashSync(data.password, 10);
  const uuid = uuidv4();
  const result = db.prepare(`
    INSERT INTO users (uuid, email, phone, username, password_hash)
    VALUES (?, ?, ?, ?, ?)
  `).run(uuid, data.email || null, data.phone || null, data.username || null, passwordHash);
  
  const userId = Number(result.lastInsertRowid);
  createUserRootDirectory(userId);
  
  return getUserById(userId)!;
}

export function verifyPassword(user: User, password: string): boolean {
  return bcrypt.compareSync(password, user.password_hash);
}

export function updateUser(id: number, data: Partial<User>): boolean {
  const fields = Object.keys(data)
    .filter(k => k !== 'id' && k !== 'uuid' && k !== 'password_hash')
    .map(k => `${k} = ?`);
  
  if (fields.length === 0) return false;
  
  const values = Object.values(data).filter((_, i) => 
    Object.keys(data)[i] !== 'id' && Object.keys(data)[i] !== 'uuid' && Object.keys(data)[i] !== 'password_hash'
  );
  values.push(id);
  
  const result = db.prepare(`UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
  return result.changes > 0;
}

function createUserRootDirectory(userId: number): void {
  const uuid = uuidv4();
  db.prepare(`
    INSERT INTO nodes (uuid, name, type, owner_id)
    VALUES (?, ?, ?, ?)
  `).run(uuid, '/', 'dir', userId);
}

export function getConfig(userId: number | null, key: string, defaultValue: string): string {
  if (userId === null) {
    const row = db.prepare('SELECT value FROM config WHERE key = ?').get(key) as { value: string } | undefined;
    return row?.value ?? defaultValue;
  }
  const row = db.prepare('SELECT value FROM user_config WHERE user_id = ? AND key = ?').get(userId, key) as { value: string } | undefined;
  return row?.value ?? defaultValue;
}

export function setConfig(userId: number | null, key: string, value: string): void {
  if (userId === null) {
    db.prepare('INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)').run(key, value);
  } else {
    db.prepare('INSERT OR REPLACE INTO user_config (user_id, key, value, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(userId, key, value);
  }
}

export function getAllAliases(userId: number | null): Map<string, string> {
  if (userId === null) {
    const rows = db.prepare('SELECT alias, command FROM aliases').all() as { alias: string; command: string }[];
    return new Map(rows.map(row => [row.alias, row.command]));
  }
  const rows = db.prepare('SELECT alias, command FROM user_aliases WHERE user_id = ?').all(userId) as { alias: string; command: string }[];
  return new Map(rows.map(row => [row.alias, row.command]));
}

export function setAlias(userId: number | null, alias: string, command: string): void {
  if (userId === null) {
    db.prepare('INSERT OR REPLACE INTO aliases (alias, command) VALUES (?, ?)').run(alias, command);
  } else {
    db.prepare('INSERT OR REPLACE INTO user_aliases (user_id, alias, command) VALUES (?, ?, ?)').run(userId, alias, command);
  }
}

export function deleteAlias(userId: number | null, alias: string): boolean {
  if (userId === null) {
    const result = db.prepare('DELETE FROM aliases WHERE alias = ?').run(alias);
    return result.changes > 0;
  }
  const result = db.prepare('DELETE FROM user_aliases WHERE user_id = ? AND alias = ?').run(userId, alias);
  return result.changes > 0;
}

export function addCommandHistory(userId: number | null, command: string, path: string, context?: string): void {
  if (userId === null) {
    db.prepare('INSERT INTO command_history (command, path) VALUES (?, ?)').run(command, path);
  } else {
    db.prepare('INSERT INTO user_command_history (user_id, command, path, context) VALUES (?, ?, ?, ?)').run(userId, command, path, context || null);
  }
}

export function getCommandHistory(userId: number | null, limit?: number): { id: number; command: string; path: string; created_at: string }[] {
  if (userId === null) {
    if (limit) {
      return db.prepare('SELECT id, command, path, created_at FROM command_history ORDER BY id DESC LIMIT ?').all(limit) as { id: number; command: string; path: string; created_at: string }[];
    }
    return db.prepare('SELECT id, command, path, created_at FROM command_history ORDER BY id DESC').all() as { id: number; command: string; path: string; created_at: string }[];
  }
  if (limit) {
    return db.prepare('SELECT id, command, path, created_at FROM user_command_history WHERE user_id = ? ORDER BY id DESC LIMIT ?').all(userId, limit) as { id: number; command: string; path: string; created_at: string }[];
  }
  return db.prepare('SELECT id, command, path, created_at FROM user_command_history WHERE user_id = ? ORDER BY id DESC').all(userId) as { id: number; command: string; path: string; created_at: string }[];
}

export function searchCommandHistory(userId: number | null, pattern: string): { id: number; command: string; path: string; created_at: string }[] {
  if (userId === null) {
    return db.prepare('SELECT id, command, path, created_at FROM command_history WHERE command LIKE ? ORDER BY id DESC').all(`%${pattern}%`) as { id: number; command: string; path: string; created_at: string }[];
  }
  return db.prepare('SELECT id, command, path, created_at FROM user_command_history WHERE user_id = ? AND command LIKE ? ORDER BY id DESC').all(userId, `%${pattern}%`) as { id: number; command: string; path: string; created_at: string }[];
}

export function deleteCommandHistory(userId: number | null, id: number): boolean {
  if (userId === null) {
    const result = db.prepare('DELETE FROM command_history WHERE id = ?').run(id);
    return result.changes > 0;
  }
  const result = db.prepare('DELETE FROM user_command_history WHERE user_id = ? AND id = ?').run(userId, id);
  return result.changes > 0;
}

export function clearCommandHistory(userId: number | null): void {
  if (userId === null) {
    db.prepare('DELETE FROM command_history').run();
  } else {
    db.prepare('DELETE FROM user_command_history WHERE user_id = ?').run(userId);
  }
}

export function createTeam(name: string, description: string | undefined, createdBy: number): Team {
  const uuid = uuidv4();
  const result = db.prepare(`
    INSERT INTO teams (uuid, name, description, created_by)
    VALUES (?, ?, ?, ?)
  `).run(uuid, name, description || null, createdBy);
  
  const teamId = Number(result.lastInsertRowid);
  addTeamMember(teamId, createdBy, 'admin');
  createTeamRootDirectory(teamId);
  
  return db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId) as Team;
}

export function addTeamMember(teamId: number, userId: number, role: 'admin' | 'member' | 'guest'): boolean {
  try {
    db.prepare('INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)').run(teamId, userId, role);
    return true;
  } catch {
    return false;
  }
}

function createTeamRootDirectory(teamId: number): void {
  const uuid = uuidv4();
  db.prepare(`
    INSERT INTO nodes (uuid, name, type, team_id)
    VALUES (?, ?, ?, ?)
  `).run(uuid, '/', 'dir', teamId);
}

export function createShare(
  nodeId: number,
  createdBy: number,
  permission: 'read' | 'edit',
  expiresAt?: Date,
  password?: string
): Share {
  const uuid = uuidv4();
  const passwordHash = password ? bcrypt.hashSync(password, 10) : undefined;
  const result = db.prepare(`
    INSERT INTO shares (uuid, node_id, created_by, permission, expires_at, password)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(uuid, nodeId, createdBy, permission, expiresAt?.toISOString() || null, passwordHash || null);
  
  return db.prepare('SELECT * FROM shares WHERE id = ?').get(Number(result.lastInsertRowid)) as Share;
}

export function getShareByUuid(uuid: string): Share | undefined {
  return db.prepare('SELECT * FROM shares WHERE uuid = ?').get(uuid) as Share | undefined;
}

export function deleteShare(id: number): boolean {
  const result = db.prepare('DELETE FROM shares WHERE id = ?').run(id);
  return result.changes > 0;
}

export function createPlugin(data: {
  name: string;
  description?: string;
  version: string;
  author?: string;
  code: string;
  commands?: string;
  isPublic?: boolean;
  createdBy?: number;
}): Plugin {
  const uuid = uuidv4();
  const result = db.prepare(`
    INSERT INTO plugins (uuid, name, description, version, author, code, commands, is_public, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuid,
    data.name,
    data.description || null,
    data.version,
    data.author || null,
    data.code,
    data.commands || null,
    data.isPublic !== false ? 1 : 0,
    data.createdBy || null
  );
  
  return db.prepare('SELECT * FROM plugins WHERE id = ?').get(Number(result.lastInsertRowid)) as Plugin;
}

export function getPluginById(id: number): Plugin | undefined {
  return db.prepare('SELECT * FROM plugins WHERE id = ?').get(id) as Plugin | undefined;
}

export function getPluginByUuid(uuid: string): Plugin | undefined {
  return db.prepare('SELECT * FROM plugins WHERE uuid = ?').get(uuid) as Plugin | undefined;
}

export function searchPlugins(query: string): Plugin[] {
  return db.prepare(`
    SELECT * FROM plugins 
    WHERE is_public = 1 
    AND (name LIKE ? OR description LIKE ? OR author LIKE ?)
    ORDER BY download_count DESC
  `).all(`%${query}%`, `%${query}%`, `%${query}%`) as Plugin[];
}

export function installPlugin(userId: number, pluginId: number): boolean {
  try {
    db.prepare('INSERT INTO user_plugins (user_id, plugin_id) VALUES (?, ?)').run(userId, pluginId);
    db.prepare('UPDATE plugins SET download_count = download_count + 1 WHERE id = ?').run(pluginId);
    return true;
  } catch {
    return false;
  }
}

export function getUserPlugins(userId: number): Plugin[] {
  return db.prepare(`
    SELECT p.* FROM plugins p
    JOIN user_plugins up ON p.id = up.plugin_id
    WHERE up.user_id = ?
    ORDER BY up.installed_at DESC
  `).all(userId) as Plugin[];
}

export function uninstallPlugin(userId: number, pluginId: number): boolean {
  const result = db.prepare('DELETE FROM user_plugins WHERE user_id = ? AND plugin_id = ?').run(userId, pluginId);
  return result.changes > 0;
}

export function getUserTeams(userId: number): Team[] {
  return db.prepare(`
    SELECT t.* FROM teams t
    JOIN team_members tm ON t.id = tm.team_id
    WHERE tm.user_id = ?
    ORDER BY t.created_at DESC
  `).all(userId) as Team[];
}

export function getTeamMembers(teamId: number): (TeamMember & { username?: string; email?: string })[] {
  return db.prepare(`
    SELECT tm.*, u.username, u.email
    FROM team_members tm
    JOIN users u ON tm.user_id = u.id
    WHERE tm.team_id = ?
  `).all(teamId) as (TeamMember & { username?: string; email?: string })[];
}

export function updateTeamMemberRole(teamId: number, userId: number, role: 'admin' | 'member' | 'guest'): boolean {
  const result = db.prepare('UPDATE team_members SET role = ? WHERE team_id = ? AND user_id = ?').run(role, teamId, userId);
  return result.changes > 0;
}

export function removeTeamMember(teamId: number, userId: number): boolean {
  const result = db.prepare('DELETE FROM team_members WHERE team_id = ? AND user_id = ?').run(teamId, userId);
  return result.changes > 0;
}

export function getNodeOwner(nodeId: number): { ownerId?: number; teamId?: number } | null {
  const node = db.prepare('SELECT owner_id, team_id FROM nodes WHERE id = ?').get(nodeId) as { owner_id?: number; team_id?: number } | undefined;
  if (!node) return null;
  return { ownerId: node.owner_id, teamId: node.team_id };
}

export function getUserNodes(userId: number): FileNode[] {
  return db.prepare('SELECT * FROM nodes WHERE owner_id = ?').all(userId) as FileNode[];
}

export function getTeamNodes(teamId: number): FileNode[] {
  return db.prepare('SELECT * FROM nodes WHERE team_id = ?').all(teamId) as FileNode[];
}

export default db;
