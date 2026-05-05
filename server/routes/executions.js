const express = require('express');
const router = express.Router();
const { readData, writeData, generateId } = require('../utils/dataStore');

const DATA_FILE = 'executions.json';

router.get('/', (req, res) => {
  const executions = readData(DATA_FILE);
  const { workflowId, robotId, status, limit = 50 } = req.query;
  
  let filtered = executions;
  
  if (workflowId) {
    filtered = filtered.filter(e => e.workflowId === workflowId);
  }
  if (robotId) {
    filtered = filtered.filter(e => e.robotId === robotId);
  }
  if (status) {
    filtered = filtered.filter(e => e.status === status);
  }
  
  res.json(filtered.slice(0, parseInt(limit)));
});

router.get('/:id', (req, res) => {
  const executions = readData(DATA_FILE);
  const execution = executions.find(e => e.id === req.params.id);
  if (!execution) {
    return res.status(404).json({ error: '执行记录不存在' });
  }
  res.json(execution);
});

router.post('/', (req, res) => {
  const executions = readData(DATA_FILE);
  const newExecution = {
    id: `exec-${generateId().substring(0, 8)}`,
    workflowId: req.body.workflowId,
    robotId: req.body.robotId,
    name: req.body.name || '未命名执行',
    status: req.body.status || 'running',
    type: req.body.type || 'manual',
    scheduleId: req.body.scheduleId,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: null,
    logs: req.body.logs || [{
      timestamp: new Date().toISOString(),
      level: 'info',
      message: '流程执行开始'
    }],
    steps: req.body.steps || [],
    error: null,
    retryAttempts: 0,
    createdAt: new Date().toISOString()
  };
  executions.unshift(newExecution);
  writeData(DATA_FILE, executions);
  res.status(201).json(newExecution);
});

router.put('/:id', (req, res) => {
  const executions = readData(DATA_FILE);
  const index = executions.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '执行记录不存在' });
  }
  executions[index] = {
    ...executions[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  writeData(DATA_FILE, executions);
  res.json(executions[index]);
});

router.post('/:id/log', (req, res) => {
  const executions = readData(DATA_FILE);
  const index = executions.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '执行记录不存在' });
  }
  
  const newLog = {
    timestamp: new Date().toISOString(),
    level: req.body.level || 'info',
    message: req.body.message || '',
    nodeId: req.body.nodeId
  };
  
  executions[index].logs.push(newLog);
  executions[index].updatedAt = new Date().toISOString();
  writeData(DATA_FILE, executions);
  
  res.json(newLog);
});

router.post('/:id/step', (req, res) => {
  const executions = readData(DATA_FILE);
  const index = executions.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '执行记录不存在' });
  }
  
  const stepIndex = executions[index].steps.findIndex(s => s.nodeId === req.body.nodeId);
  const newStep = {
    nodeId: req.body.nodeId,
    name: req.body.name,
    status: req.body.status || 'running',
    startTime: req.body.startTime || new Date().toISOString(),
    endTime: req.body.endTime,
    error: req.body.error
  };
  
  if (stepIndex >= 0) {
    executions[index].steps[stepIndex] = {
      ...executions[index].steps[stepIndex],
      ...newStep
    };
  } else {
    executions[index].steps.push(newStep);
  }
  
  executions[index].updatedAt = new Date().toISOString();
  writeData(DATA_FILE, executions);
  
  res.json(newStep);
});

router.post('/:id/complete', (req, res) => {
  const executions = readData(DATA_FILE);
  const index = executions.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '执行记录不存在' });
  }
  
  const endTime = new Date().toISOString();
  const startTime = new Date(executions[index].startTime);
  const duration = new Date(endTime) - startTime;
  
  executions[index].status = req.body.status || 'success';
  executions[index].endTime = endTime;
  executions[index].duration = duration;
  executions[index].error = req.body.error;
  executions[index].updatedAt = endTime;
  
  executions[index].logs.push({
    timestamp: endTime,
    level: executions[index].status === 'success' ? 'info' : 'error',
    message: executions[index].status === 'success' 
      ? '流程执行成功完成' 
      : `流程执行失败: ${req.body.error || '未知错误'}`
  });
  
  writeData(DATA_FILE, executions);
  res.json(executions[index]);
});

router.post('/:id/cancel', (req, res) => {
  const executions = readData(DATA_FILE);
  const index = executions.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '执行记录不存在' });
  }
  
  const endTime = new Date().toISOString();
  const startTime = new Date(executions[index].startTime);
  const duration = new Date(endTime) - startTime;
  
  executions[index].status = 'cancelled';
  executions[index].endTime = endTime;
  executions[index].duration = duration;
  executions[index].updatedAt = endTime;
  
  executions[index].logs.push({
    timestamp: endTime,
    level: 'warn',
    message: '流程执行已被用户取消'
  });
  
  writeData(DATA_FILE, executions);
  res.json(executions[index]);
});

module.exports = router;
