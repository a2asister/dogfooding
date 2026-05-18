import Database from 'better-sqlite3';

export type DatabaseType = InstanceType<typeof Database>;

export interface SimulationRecord {
  id: number;
  name: string;
  type: string;
  config: string;
  created_at: string;
  updated_at: string;
}

export interface ExperimentRecord {
  id: number;
  simulation_id: number;
  name: string;
  parameters: string;
  result: string;
  created_at: string;
}

export function initDatabase(dbPath: string): DatabaseType {
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS simulations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      config TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS experiments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      simulation_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      parameters TEXT NOT NULL,
      result TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (simulation_id) REFERENCES simulations (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_experiments_simulation_id ON experiments (simulation_id);
  `);

  return db;
}

export function getAllSimulations(db: DatabaseType): SimulationRecord[] {
  const stmt = db.prepare('SELECT * FROM simulations ORDER BY updated_at DESC');
  return stmt.all() as SimulationRecord[];
}

export function getSimulationById(db: DatabaseType, id: number): SimulationRecord | null {
  const stmt = db.prepare('SELECT * FROM simulations WHERE id = ?');
  const result = stmt.get(id) as SimulationRecord | undefined;
  return result ?? null;
}

export function createSimulation(
  db: DatabaseType,
  name: string,
  type: string,
  config: string
): number {
  const stmt = db.prepare(
    'INSERT INTO simulations (name, type, config) VALUES (?, ?, ?)'
  );
  const result = stmt.run(name, type, config);
  return Number(result.lastInsertRowid);
}

export function updateSimulation(
  db: DatabaseType,
  id: number,
  name: string,
  config: string
): boolean {
  const stmt = db.prepare(
    'UPDATE simulations SET name = ?, config = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  );
  const result = stmt.run(name, config, id);
  return result.changes > 0;
}

export function deleteSimulation(db: DatabaseType, id: number): boolean {
  const stmt = db.prepare('DELETE FROM simulations WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function getExperimentsBySimulationId(
  db: DatabaseType,
  simulationId: number
): ExperimentRecord[] {
  const stmt = db.prepare(
    'SELECT * FROM experiments WHERE simulation_id = ? ORDER BY created_at DESC'
  );
  return stmt.all(simulationId) as ExperimentRecord[];
}

export function createExperiment(
  db: DatabaseType,
  simulationId: number,
  name: string,
  parameters: string,
  result: string
): number {
  const stmt = db.prepare(
    'INSERT INTO experiments (simulation_id, name, parameters, result) VALUES (?, ?, ?, ?)'
  );
  const stmtResult = stmt.run(simulationId, name, parameters, result);
  return Number(stmtResult.lastInsertRowid);
}
