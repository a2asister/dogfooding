import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'product_management.db');
const dataDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

async function initDatabase() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  
  db.run(`
    CREATE TABLE IF NOT EXISTS iterations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'planning',
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS requirements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'research',
      iteration_id TEXT,
      assignee TEXT,
      estimated_hours INTEGER DEFAULT 0,
      actual_hours INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS requirement_changes (
      id TEXT PRIMARY KEY,
      requirement_id TEXT NOT NULL,
      change_type TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      reason TEXT,
      impact_scope TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      requirement_id TEXT NOT NULL,
      reviewer TEXT NOT NULL,
      status TEXT NOT NULL,
      comments TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      requirement_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'todo',
      assignee TEXT,
      estimated_hours INTEGER DEFAULT 0,
      actual_hours INTEGER DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bugs (
      id TEXT PRIMARY KEY,
      requirement_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      severity TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'open',
      assignee TEXT,
      iteration_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS deployments (
      id TEXT PRIMARY KEY,
      iteration_id TEXT NOT NULL,
      environment TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      grayscale_percentage INTEGER DEFAULT 0,
      grayscale_users TEXT,
      deployed_at TEXT,
      rollback_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS retrospectives (
      id TEXT PRIMARY KEY,
      iteration_id TEXT NOT NULL,
      went_well TEXT,
      improvements TEXT,
      action_items TEXT,
      velocity INTEGER DEFAULT 0,
      bug_rate REAL DEFAULT 0,
      completion_rate REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id TEXT PRIMARY KEY,
      user_name TEXT,
      content TEXT NOT NULL,
      category TEXT,
      related_requirement_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  saveDatabase();
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function prepare(sql) {
  const statement = db.prepare(sql);
  return {
    run: function(...params) {
      statement.bind(params);
      while (statement.step()) {}
      statement.free();
      saveDatabase();
    },
    all: function(...params) {
      statement.bind(params);
      const results = [];
      while (statement.step()) {
        results.push(statement.getAsObject());
      }
      statement.free();
      return results;
    },
    get: function(...params) {
      statement.bind(params);
      let result = null;
      if (statement.step()) {
        result = statement.getAsObject();
      }
      statement.free();
      return result;
    }
  };
}

initDatabase();

export default {
  prepare,
  exec: (sql) => {
    db.run(sql);
    saveDatabase();
  }
};
