import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../data/kpi.db');
const db: Database.Database = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
