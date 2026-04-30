const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const getLogFileName = () => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  return path.join(logDir, `${dateStr}.log`);
};

const formatLog = (level, message) => {
  const now = new Date();
  const timestamp = now.toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
};

const logSystem = {
  info: (message) => {
    const logEntry = formatLog('info', message);
    console.log(logEntry.trim());
    fs.appendFileSync(getLogFileName(), logEntry);
  },
  
  error: (message) => {
    const logEntry = formatLog('error', message);
    console.error(logEntry.trim());
    fs.appendFileSync(getLogFileName(), logEntry);
  },
  
  warn: (message) => {
    const logEntry = formatLog('warn', message);
    console.warn(logEntry.trim());
    fs.appendFileSync(getLogFileName(), logEntry);
  },
  
  debug: (message) => {
    const logEntry = formatLog('debug', message);
    console.debug(logEntry.trim());
    fs.appendFileSync(getLogFileName(), logEntry);
  },
  
  operation: (userId, action, details) => {
    const message = `操作日志 - 用户ID: ${userId}, 操作: ${action}, 详情: ${JSON.stringify(details)}`;
    logSystem.info(message);
  },
  
  getLogs: (date) => {
    const logFile = date 
      ? path.join(logDir, `${date}.log`)
      : getLogFileName();
    
    if (fs.existsSync(logFile)) {
      return fs.readFileSync(logFile, 'utf-8');
    }
    return null;
  }
};

module.exports = logSystem;
