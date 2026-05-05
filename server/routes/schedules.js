const express = require('express');
const router = express.Router();
const { readData, writeData, generateId } = require('../utils/dataStore');

const DATA_FILE = 'schedules.json';

router.get('/', (req, res) => {
  const schedules = readData(DATA_FILE);
  res.json(schedules);
});

router.get('/:id', (req, res) => {
  const schedules = readData(DATA_FILE);
  const schedule = schedules.find(s => s.id === req.params.id);
  if (!schedule) {
    return res.status(404).json({ error: '定时任务不存在' });
  }
  res.json(schedule);
});

router.post('/', (req, res) => {
  const schedules = readData(DATA_FILE);
  const newSchedule = {
    id: `schedule-${generateId().substring(0, 8)}`,
    name: req.body.name,
    description: req.body.description || '',
    workflowId: req.body.workflowId,
    robotId: req.body.robotId,
    type: req.body.type || 'cron',
    cronExpression: req.body.cronExpression || '0 0 * * *',
    intervalMinutes: req.body.intervalMinutes,
    enabled: req.body.enabled !== undefined ? req.body.enabled : true,
    lastRun: null,
    nextRun: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  schedules.unshift(newSchedule);
  writeData(DATA_FILE, schedules);
  res.status(201).json(newSchedule);
});

router.put('/:id', (req, res) => {
  const schedules = readData(DATA_FILE);
  const index = schedules.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '定时任务不存在' });
  }
  schedules[index] = {
    ...schedules[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  writeData(DATA_FILE, schedules);
  res.json(schedules[index]);
});

router.delete('/:id', (req, res) => {
  const schedules = readData(DATA_FILE);
  const index = schedules.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '定时任务不存在' });
  }
  schedules.splice(index, 1);
  writeData(DATA_FILE, schedules);
  res.json({ success: true, message: '定时任务已删除' });
});

router.post('/:id/toggle', (req, res) => {
  const schedules = readData(DATA_FILE);
  const index = schedules.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '定时任务不存在' });
  }
  schedules[index].enabled = !schedules[index].enabled;
  schedules[index].updatedAt = new Date().toISOString();
  writeData(DATA_FILE, schedules);
  res.json(schedules[index]);
});

router.post('/:id/run', (req, res) => {
  const schedules = readData(DATA_FILE);
  const schedule = schedules.find(s => s.id === req.params.id);
  if (!schedule) {
    return res.status(404).json({ error: '定时任务不存在' });
  }
  
  const executions = readData('executions.json');
  const newExecution = {
    id: `exec-${generateId().substring(0, 8)}`,
    workflowId: schedule.workflowId,
    robotId: schedule.robotId,
    name: schedule.name,
    status: 'running',
    type: 'scheduled',
    scheduleId: schedule.id,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: null,
    logs: [{
      timestamp: new Date().toISOString(),
      level: 'info',
      message: '流程执行开始（定时任务触发）'
    }],
    steps: [],
    createdAt: new Date().toISOString()
  };
  executions.unshift(newExecution);
  writeData('executions.json', executions);
  
  const index = schedules.findIndex(s => s.id === req.params.id);
  schedules[index].lastRun = new Date().toISOString();
  schedules[index].updatedAt = new Date().toISOString();
  writeData(DATA_FILE, schedules);
  
  res.status(201).json(newExecution);
});

module.exports = router;
