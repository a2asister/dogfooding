const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.SQLITE_PATH || path.join(__dirname, '..', 'smart-form-engine.db');

let db = null;

function initDatabase() {
  return new Promise(async (resolve, reject) => {
    try {
      const SQL = await initSqlJs();

      if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
        console.log('SQLite 数据库已加载:', DB_PATH);
      } else {
        db = new SQL.Database();
        console.log('SQLite 数据库已创建:', DB_PATH);
      }

      createTables();

      saveDatabase();

      resolve(db);
    } catch (error) {
      reject(error);
    }
  });
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      avatar TEXT,
      roles TEXT DEFAULT '[]',
      department TEXT,
      phone TEXT,
      isActive INTEGER DEFAULT 1,
      permissions TEXT DEFAULT '[]',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT '通用',
      fields TEXT DEFAULT '[]',
      layout TEXT DEFAULT '{"type":"flex","columns":1,"gutter":16}',
      rules TEXT DEFAULT '{}',
      linkage TEXT DEFAULT '{}',
      workflows TEXT DEFAULT '[]',
      permissions TEXT DEFAULT '{}',
      createdBy TEXT,
      status TEXT DEFAULT 'draft',
      version INTEGER DEFAULT 1,
      isTemplate INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      formId TEXT NOT NULL,
      formVersion INTEGER DEFAULT 1,
      data TEXT DEFAULT '{}',
      status TEXT DEFAULT 'draft',
      currentWorkflowStep TEXT,
      workflowHistory TEXT DEFAULT '[]',
      createdBy TEXT,
      updatedBy TEXT,
      validationErrors TEXT DEFAULT '[]',
      isRead INTEGER DEFAULT 0,
      isStarred INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      assignee TEXT,
      approvers TEXT DEFAULT '[]',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (formId) REFERENCES forms(id)
    )
  `);

  db.run('CREATE INDEX IF NOT EXISTS idx_submissions_formId ON submissions(formId)');
  db.run('CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status)');
  db.run('CREATE INDEX IF NOT EXISTS idx_submissions_createdBy ON submissions(createdBy)');
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function getDb() {
  return db;
}

module.exports = {
  initDatabase,
  getDb,
  saveDatabase
};
