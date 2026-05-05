const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const workflowsRouter = require('./routes/workflows');
const robotsRouter = require('./routes/robots');
const schedulesRouter = require('./routes/schedules');
const scriptsRouter = require('./routes/scripts');
const apisRouter = require('./routes/apis');
const executionsRouter = require('./routes/executions');
const recordingsRouter = require('./routes/recordings');
const rulesEngine = require('./utils/rulesEngine');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/workflows', workflowsRouter);
app.use('/api/robots', robotsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/scripts', scriptsRouter);
app.use('/api/apis', apisRouter);
app.use('/api/executions', executionsRouter);
app.use('/api/recordings', recordingsRouter);

app.use('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use('/api/stats', (req, res) => {
  const fs = require('fs');
  const dataPath = path.join(__dirname, '../data');
  
  const workflows = JSON.parse(fs.readFileSync(path.join(dataPath, 'workflows.json'), 'utf8'));
  const robots = JSON.parse(fs.readFileSync(path.join(dataPath, 'robots.json'), 'utf8'));
  const schedules = JSON.parse(fs.readFileSync(path.join(dataPath, 'schedules.json'), 'utf8'));
  const executions = JSON.parse(fs.readFileSync(path.join(dataPath, 'executions.json'), 'utf8'));
  
  const successfulExecutions = executions.filter(e => e.status === 'success').length;
  const failedExecutions = executions.filter(e => e.status === 'failed').length;
  const runningExecutions = executions.filter(e => e.status === 'running').length;
  const activeSchedules = schedules.filter(s => s.enabled).length;
  const activeRobots = robots.filter(r => r.status === 'online').length;
  
  res.json({
    totalWorkflows: workflows.length,
    totalRobots: robots.length,
    activeRobots,
    totalSchedules: schedules.length,
    activeSchedules,
    totalExecutions: executions.length,
    successfulExecutions,
    failedExecutions,
    runningExecutions
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RPA Platform Server running on port ${PORT}`);
  console.log(`📊 API endpoint: http://localhost:${PORT}/api`);
  rulesEngine.initialize();
});

module.exports = app;
