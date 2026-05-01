import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { JsonStorage } from './utils/jsonStorage';
import { AuthService } from './services/authService';
import { DocumentService } from './services/documentService';
import { createAuthRouter } from './routes/authRoutes';
import { createDocumentRouter } from './routes/documentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 38765;
const JWT_SECRET = process.env.JWT_SECRET || 'knowledge-base-secret-key-2024';
const STORAGE_PATH = process.env.STORAGE_PATH || './data';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = new JsonStorage(STORAGE_PATH);
const authService = new AuthService(storage, JWT_SECRET);
const documentService = new DocumentService(storage);

async function initializeAdmin() {
  const users = storage.getUsers();
  if (users.length === 0) {
    try {
      await authService.register('admin', 'admin123', 'admin');
      console.log('默认管理员账户已创建:');
      console.log('  用户名: admin');
      console.log('  密码: admin123');
    } catch (error) {
      console.log('管理员账户已存在');
    }
  }
}

app.use('/api/auth', createAuthRouter(authService));
app.use('/api/documents', createDocumentRouter(documentService, authService));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, async () => {
  console.log(`企业知识库语义检索平台后端服务已启动`);
  console.log(`服务地址: http://localhost:${PORT}`);
  console.log(`API 文档可用于: http://localhost:${PORT}/api/health`);
  await initializeAdmin();
});
