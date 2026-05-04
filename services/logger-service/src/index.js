const express = require('express');
const cors = require('cors');
const logger = require('./logger');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const logEntries = [];

const logLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];

app.get('/health', (req, res) => {
  logger.info('Health check endpoint called');
  res.json({
    status: 'healthy',
    service: 'logger-service',
    timestamp: new Date().toISOString()
  });
});

app.post('/log', (req, res) => {
  const { level, message, service, data, timestamp } = req.body;

  if (!message) {
    return res.status(400).json({
      error: 'Message is required'
    });
  }

  const logLevel = level || 'info';
  const logEntry = {
    id: uuidv4(),
    level: logLevel,
    message,
    service: service || 'unknown',
    data: data || {},
    timestamp: timestamp || new Date().toISOString()
  };

  logEntries.unshift(logEntry);

  if (logEntries.length > 10000) {
    logEntries.splice(10000);
  }

  logger.log({
    level: logLevel,
    message,
    service: logEntry.service,
    data: logEntry.data
  });

  res.json({
    success: true,
    log: logEntry
  });
});

app.get('/logs', (req, res) => {
  const { service, level, startDate, endDate, limit = 100, offset = 0 } = req.query;

  let filteredLogs = [...logEntries];

  if (service) {
    filteredLogs = filteredLogs.filter(log => log.service === service);
  }

  if (level) {
    const levelIndex = logLevels.indexOf(level);
    filteredLogs = filteredLogs.filter(log => {
      const logLevelIndex = logLevels.indexOf(log.level);
      return logLevelIndex <= levelIndex;
    });
  }

  if (startDate) {
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(startDate));
  }

  if (endDate) {
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(endDate));
  }

  const total = filteredLogs.length;
  const paginatedLogs = filteredLogs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.json({
    total,
    limit: parseInt(limit),
    offset: parseInt(offset),
    logs: paginatedLogs
  });
});

app.get('/logs/stats', (req, res) => {
  const { service, startDate, endDate } = req.query;

  let filteredLogs = [...logEntries];

  if (service) {
    filteredLogs = filteredLogs.filter(log => log.service === service);
  }

  if (startDate) {
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(startDate));
  }

  if (endDate) {
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(endDate));
  }

  const stats = {
    total: filteredLogs.length,
    byLevel: {},
    byService: {}
  };

  filteredLogs.forEach(log => {
    stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
    stats.byService[log.service] = (stats.byService[log.service] || 0) + 1;
  });

  res.json(stats);
});

app.listen(PORT, () => {
  logger.info(`Logger service running on port ${PORT}`);
});
