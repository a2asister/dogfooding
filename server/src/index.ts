import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { setupSimulationRoutes } from './routes/simulations';
import { setupExperimentRoutes } from './routes/experiments';
import { initDatabase } from './db';

type DatabaseType = InstanceType<typeof Database>;

const PORT = 38764;

const app: Express = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const dbPath = path.join(__dirname, '../data/physics.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db: DatabaseType = initDatabase(dbPath);

app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

setupSimulationRoutes(app, db);
setupExperimentRoutes(app, db);

app.use('/wasm', express.static(path.join(__dirname, '../../public/wasm')));

app.listen(PORT, (): void => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { app, db };
