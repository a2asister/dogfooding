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
      iteration TEXT DEFAULT '',
      parentId TEXT,
      isPinned INTEGER NOT NULL DEFAULT 0,
      isArchived INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
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

    CREATE INDEX IF NOT EXISTS idx_tasks_projectId ON tasks(projectId);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
    CREATE INDEX IF NOT EXISTS idx_task_logs_taskId ON task_logs(taskId);
  `);
}

initDatabase();

export default db;
