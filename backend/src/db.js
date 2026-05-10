import initSqlJs from 'sql.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'activities.db');

let db = null;

async function initDB() {
  const SQL = await initSqlJs();
  
  const dataDir = path.dirname(dbPath);
  await fs.ensureDir(dataDir);
  
  let dbBuffer = null;
  if (await fs.pathExists(dbPath)) {
    dbBuffer = await fs.readFile(dbPath);
  }
  
  db = new SQL.Database(dbBuffer);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      location TEXT,
      start_time DATETIME,
      end_time DATETIME,
      max_participants INTEGER DEFAULT 100,
      current_participants INTEGER DEFAULT 0,
      budget REAL DEFAULT 0,
      expected_revenue REAL DEFAULT 0,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      activity_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      company TEXT,
      position TEXT,
      registration_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      checkin_time DATETIME,
      checkout_time DATETIME,
      status TEXT DEFAULT 'registered',
      interaction_count INTEGER DEFAULT 0
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS interactions (
      id TEXT PRIMARY KEY,
      activity_id TEXT NOT NULL,
      registration_id TEXT,
      user_phone TEXT,
      type TEXT NOT NULL,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS roi_metrics (
      id TEXT PRIMARY KEY,
      activity_id TEXT NOT NULL,
      actual_attendees INTEGER DEFAULT 0,
      new_leads INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      actual_revenue REAL DEFAULT 0,
      marketing_cost REAL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  await saveDB();
}

async function saveDB() {
  const data = db.export();
  const buffer = Buffer.from(data);
  await fs.writeFile(dbPath, buffer);
}

function prepare(sql) {
  const stmt = db.prepare(sql);
  
  return {
    get(...params) {
      stmt.bind(params);
      if (stmt.step()) {
        const result = stmt.getAsObject();
        stmt.reset();
        return result;
      }
      stmt.reset();
      return undefined;
    },
    all(...params) {
      stmt.bind(params);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.reset();
      return results;
    },
    run(...params) {
      stmt.bind(params);
      stmt.step();
      stmt.reset();
      const changes = db.getRowsModified();
      saveDB().catch(console.error);
      return { changes, lastInsertRowid: null };
    }
  };
}

function exec(sql) {
  db.run(sql);
  saveDB().catch(console.error);
}

export default {
  init: initDB,
  prepare,
  exec,
  pragma: () => {}
};
