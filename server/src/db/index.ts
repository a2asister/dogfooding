import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../data/app.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('software', 'general')),
      manager TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'archived')),
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('requirement', 'task', 'bug', 'optimization', 'subtask')),
      status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'in_progress', 'done', 'closed')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('highest', 'high', 'medium', 'low', 'lowest')),
      description TEXT DEFAULT '',
      assignee TEXT NOT NULL,
      reporter TEXT NOT NULL,
      dueDate TEXT,
      sprintId TEXT,
      versionId TEXT,
      parentId TEXT,
      storyPoints INTEGER DEFAULT 0,
      isPinned INTEGER NOT NULL DEFAULT 0,
      isArchived INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (sprintId) REFERENCES sprints(id) ON DELETE SET NULL,
      FOREIGN KEY (versionId) REFERENCES versions(id) ON DELETE SET NULL,
      FOREIGN KEY (parentId) REFERENCES tasks(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS task_logs (
      id TEXT PRIMARY KEY,
      taskId TEXT NOT NULL,
      action TEXT NOT NULL,
      oldValue TEXT,
      newValue TEXT,
      operator TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      realName TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'developer',
      avatar TEXT,
      phone TEXT,
      departmentId TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (departmentId) REFERENCES organizations(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parentId TEXT,
      type TEXT NOT NULL CHECK(type IN ('company', 'department', 'team')),
      leaderId TEXT,
      description TEXT DEFAULT '',
      sort INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (parentId) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (leaderId) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sprints (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      name TEXT NOT NULL,
      goal TEXT DEFAULT '',
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'planning' CHECK(status IN ('planning', 'active', 'paused', 'completed')),
      velocity INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS backlog_items (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      type TEXT NOT NULL CHECK(type IN ('feature', 'enhancement', 'bug', 'epic')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('highest', 'high', 'medium', 'low', 'lowest')),
      storyPoints INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'backlog' CHECK(status IN ('backlog', 'refined', 'ready', 'in_sprint', 'done')),
      assignee TEXT,
      reporter TEXT NOT NULL,
      sprintId TEXT,
      sort INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (sprintId) REFERENCES sprints(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS versions (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('sprint', 'release')),
      status TEXT NOT NULL DEFAULT 'planning' CHECK(status IN ('planning', 'developing', 'testing', 'released', 'archived')),
      releaseDate TEXT,
      description TEXT DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS board_columns (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      width INTEGER DEFAULT 280,
      sort INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_projectId ON tasks(projectId);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
    CREATE INDEX IF NOT EXISTS idx_tasks_sprintId ON tasks(sprintId);
    CREATE INDEX IF NOT EXISTS idx_tasks_versionId ON tasks(versionId);
    CREATE INDEX IF NOT EXISTS idx_task_logs_taskId ON task_logs(taskId);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_departmentId ON users(departmentId);
    CREATE INDEX IF NOT EXISTS idx_organizations_parentId ON organizations(parentId);
    CREATE INDEX IF NOT EXISTS idx_sprints_projectId ON sprints(projectId);
    CREATE INDEX IF NOT EXISTS idx_sprints_status ON sprints(status);
    CREATE INDEX IF NOT EXISTS idx_backlog_items_projectId ON backlog_items(projectId);
    CREATE INDEX IF NOT EXISTS idx_backlog_items_sprintId ON backlog_items(sprintId);
    CREATE INDEX IF NOT EXISTS idx_versions_projectId ON versions(projectId);
    CREATE INDEX IF NOT EXISTS idx_board_columns_projectId ON board_columns(projectId);
  `);
}

initDatabase();

export default db;
