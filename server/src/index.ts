import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initDatabase } from './database';
import { fileRouter } from './routes/fileRoutes';
import { encryptionRouter } from './routes/encryptionRoutes';

const PORT = 23756;
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const uploadsDir = path.join(__dirname, '../uploads');
const encryptedDir = path.join(__dirname, '../encrypted');
const dataDir = path.join(__dirname, '../data');

for (const dir of [uploadsDir, encryptedDir, dataDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

initDatabase();

app.use('/api/files', fileRouter);
app.use('/api/encryption', encryptionRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
  console.log(`Encrypted directory: ${encryptedDir}`);
});
