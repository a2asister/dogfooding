const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const logger = require('./utils/logger');
const routes = require('./routes');
const { EngineManager } = require('./engine');
const { Scheduler } = require('./scheduler');

const PORT = process.env.PORT || 4731;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/api', routes);

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

const engineManager = new EngineManager(io);
const scheduler = new Scheduler(engineManager);

app.locals.engineManager = engineManager;
app.locals.scheduler = scheduler;

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    port: PORT,
    engines: engineManager.getActiveCount(),
    scheduled: scheduler.getScheduledCount()
  });
});

httpServer.listen(PORT, () => {
  logger.info(`Workflow Automation Platform running on port ${PORT}`);
  logger.info(`API: http://localhost:${PORT}/api`);
  logger.info(`WebSocket: ws://localhost:${PORT}`);
});

module.exports = { app, io, engineManager, scheduler };