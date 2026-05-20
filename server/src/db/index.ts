import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    const dbDir = path.dirname(config.database.path);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    dbInstance = new Database(config.database.path);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initializeTables(dbInstance);
  }
  return dbInstance;
}

function initializeTables(db: Database.Database): void {
  const createTables = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      github_id INTEGER UNIQUE,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'viewer',
      access_token TEXT,
      refresh_token TEXT,
      token_expires_at INTEGER,
      password_hash TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS repositories (
      id TEXT PRIMARY KEY,
      github_id INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL,
      full_name TEXT UNIQUE NOT NULL,
      owner TEXT NOT NULL,
      description TEXT,
      html_url TEXT NOT NULL,
      default_branch TEXT NOT NULL,
      is_private INTEGER NOT NULL DEFAULT 0,
      language TEXT,
      stars INTEGER NOT NULL DEFAULT 0,
      last_synced_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS user_repositories (
      user_id TEXT NOT NULL,
      repo_id TEXT NOT NULL,
      permission TEXT NOT NULL DEFAULT 'read',
      PRIMARY KEY (user_id, repo_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (repo_id) REFERENCES repositories(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS branch_rules (
      id TEXT PRIMARY KEY,
      repo_id TEXT NOT NULL,
      branch_pattern TEXT NOT NULL,
      required_approval_count INTEGER NOT NULL DEFAULT 1,
      require_code_owner_review INTEGER NOT NULL DEFAULT 0,
      require_conversation_resolution INTEGER NOT NULL DEFAULT 0,
      require_status_checks TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (repo_id) REFERENCES repositories(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS pull_requests (
      id TEXT PRIMARY KEY,
      github_id INTEGER UNIQUE NOT NULL,
      repo_id TEXT NOT NULL,
      number INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      state TEXT NOT NULL,
      base_branch TEXT NOT NULL,
      head_branch TEXT NOT NULL,
      author TEXT NOT NULL,
      author_avatar TEXT,
      approvals TEXT,
      reviews TEXT,
      ci_status TEXT NOT NULL DEFAULT 'pending',
      mergeable INTEGER NOT NULL DEFAULT 1,
      merge_state_status TEXT,
      labels TEXT,
      merged_at INTEGER,
      closed_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (repo_id) REFERENCES repositories(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS pipelines (
      id TEXT PRIMARY KEY,
      repo_id TEXT NOT NULL,
      name TEXT NOT NULL,
      trigger_type TEXT NOT NULL,
      branch_pattern TEXT,
      language TEXT NOT NULL,
      build_script TEXT NOT NULL,
      test_script TEXT,
      deploy_script TEXT,
      environment TEXT NOT NULL,
      variables TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (repo_id) REFERENCES repositories(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS pipeline_runs (
      id TEXT PRIMARY KEY,
      pipeline_id TEXT NOT NULL,
      repo_id TEXT NOT NULL,
      commit_sha TEXT NOT NULL,
      commit_message TEXT NOT NULL,
      branch TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      stage TEXT NOT NULL DEFAULT 'queued',
      output TEXT,
      started_at INTEGER NOT NULL,
      finished_at INTEGER,
      duration INTEGER,
      triggered_by TEXT NOT NULL,
      FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE CASCADE,
      FOREIGN KEY (repo_id) REFERENCES repositories(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS environments (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      deploy_url TEXT,
      last_deployed_at INTEGER,
      last_deployed_by TEXT,
      current_version TEXT,
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS deployments (
      id TEXT PRIMARY KEY,
      env_id TEXT NOT NULL,
      repo_id TEXT NOT NULL,
      version TEXT NOT NULL,
      commit_sha TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      output TEXT,
      deployed_by TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      finished_at INTEGER,
      rollback_to TEXT,
      FOREIGN KEY (env_id) REFERENCES environments(id) ON DELETE CASCADE,
      FOREIGN KEY (repo_id) REFERENCES repositories(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS version_snapshots (
      id TEXT PRIMARY KEY,
      repo_id TEXT NOT NULL,
      version TEXT NOT NULL,
      commit_sha TEXT NOT NULL,
      commit_message TEXT NOT NULL,
      branch TEXT NOT NULL,
      tags TEXT,
      description TEXT,
      artifact_url TEXT,
      created_by TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (repo_id) REFERENCES repositories(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      target_id TEXT,
      details TEXT,
      ip TEXT,
      user_agent TEXT,
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      level TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      related_id TEXT,
      module TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)`,
    `CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module)`,
    `CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(read)`,
    `CREATE INDEX IF NOT EXISTS idx_alerts_level ON alerts(level)`,
    `CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status ON pipeline_runs(status)`,
    `CREATE INDEX IF NOT EXISTS idx_pipeline_runs_repo ON pipeline_runs(repo_id)`,
  ];

  const transaction = db.transaction(() => {
    for (const sql of createTables) {
      db.exec(sql);
    }
  });
  transaction();
}

export function runQuery<T = unknown>(query: string, params: unknown[] = []): T[] {
  const db = getDb();
  const stmt = db.prepare(query);
  return stmt.all(...params) as T[];
}

export function runOneQuery<T = unknown>(query: string, params: unknown[] = []): T | null {
  const db = getDb();
  const stmt = db.prepare(query);
  return (stmt.get(...params) as T) || null;
}

export function executeQuery(query: string, params: unknown[] = []): { changes: number; lastInsertRowid: bigint } {
  const db = getDb();
  const stmt = db.prepare(query);
  return stmt.run(...params) as { changes: number; lastInsertRowid: bigint };
}

export function executeTransaction(operations: { query: string; params: unknown[] }[]): void {
  const db = getDb();
  const transaction = db.transaction(() => {
    for (const op of operations) {
      db.prepare(op.query).run(...op.params);
    }
  });
  transaction();
}
