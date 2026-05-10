const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDatabase } = require('./models/database');
const { seedAdminUser } = require('./utils/seed');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

initDatabase()
  .then(async () => {
    console.log('SQLite 数据库连接成功');
    await seedAdminUser();
  })
  .catch(err => {
    console.error('SQLite 数据库连接失败:', err);
  });

const formRoutes = require('./routes/form');
const submissionRoutes = require('./routes/submission');
const workflowRoutes = require('./routes/workflow');
const authRoutes = require('./routes/auth');
const importExportRoutes = require('./routes/importExport');
const templateRoutes = require('./routes/template');

app.use('/api/forms', formRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/import-export', importExportRoutes);
app.use('/api/templates', templateRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '智能表单引擎服务运行中 (SQLite)' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;
