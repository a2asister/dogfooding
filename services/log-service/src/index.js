const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { format } = require('date-fns');

const app = express();
const PORT = 3001;

const LOG_DIR = path.join(__dirname, '../../data');
const LOG_FILE = path.join(LOG_DIR, 'logs.json');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, JSON.stringify([]));
}

app.use(cors());
app.use(express.json());

const readLogs = () => {
  try {
    const data = fs.readFileSync(LOG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeLogs = (logs) => {
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
};

app.post('/api/logs', (req, res) => {
  try {
    const { service, level, message, metadata } = req.body;
    
    if (!service || !level || !message) {
      return res.status(400).json({ error: 'service, level, and message are required' });
    }

    const logs = readLogs();
    const newLog = {
      id: uuidv4(),
      service,
      level,
      message,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      date: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };

    logs.unshift(newLog);
    
    const MAX_LOGS = 10000;
    if (logs.length > MAX_LOGS) {
      logs.splice(MAX_LOGS);
    }

    writeLogs(logs);
    res.status(201).json({ success: true, log: newLog });
  } catch (error) {
    console.error('Error writing log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/logs', (req, res) => {
  try {
    const { service, level, startDate, endDate, limit = 100, offset = 0 } = req.query;
    
    let logs = readLogs();

    if (service) {
      logs = logs.filter(log => log.service === service);
    }

    if (level) {
      logs = logs.filter(log => log.level === level);
    }

    if (startDate) {
      const start = new Date(startDate);
      logs = logs.filter(log => new Date(log.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      logs = logs.filter(log => new Date(log.timestamp) <= end);
    }

    const total = logs.length;
    const paginatedLogs = logs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Error reading logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/logs/stats', (req, res) => {
  try {
    const logs = readLogs();
    
    const stats = {
      total: logs.length,
      byLevel: {},
      byService: {},
      lastHour: 0,
      last24Hours: 0
    };

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    logs.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      stats.byService[log.service] = (stats.byService[log.service] || 0) + 1;

      const logTime = new Date(log.timestamp);
      if (logTime >= oneHourAgo) stats.lastHour++;
      if (logTime >= oneDayAgo) stats.last24Hours++;
    });

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting log stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/logs/:id', (req, res) => {
  try {
    const { id } = req.params;
    let logs = readLogs();
    
    const index = logs.findIndex(log => log.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Log not found' });
    }

    logs.splice(index, 1);
    writeLogs(logs);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/logs', (req, res) => {
  try {
    writeLogs([]);
    res.json({ success: true, message: 'All logs cleared' });
  } catch (error) {
    console.error('Error clearing logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`日志服务运行在 http://localhost:${PORT}`);
});
