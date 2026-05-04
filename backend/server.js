const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const subsystemRoutes = require('./routes/subsystems');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:7101',
    'http://localhost:7102',
    'http://localhost:7103'
  ],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subsystems', subsystemRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '统一登录门户后端服务运行正常',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

app.listen(config.port, () => {
  console.log(`统一登录门户后端服务运行在 http://localhost:${config.port}`);
  console.log('API 端点:');
  console.log(`  - http://localhost:${config.port}/api/health`);
  console.log(`  - http://localhost:${config.port}/api/auth/login`);
  console.log(`  - http://localhost:${config.port}/api/auth/me`);
  console.log(`  - http://localhost:${config.port}/api/users`);
  console.log(`  - http://localhost:${config.port}/api/subsystems`);
});
