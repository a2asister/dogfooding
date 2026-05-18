import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 34567;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', apiRouter);

const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

app.get('*', (_req, res) => {
  const indexPath = path.join(frontendDist, 'index.html');
  if (express.static.mime) {
    res.sendFile(indexPath);
  } else {
    res.sendFile(indexPath);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 API endpoint: http://localhost:${PORT}/api`);
});

export default app;
