const express = require('express');
const router = express.Router();
const { readData, writeData, generateId } = require('../utils/dataStore');

const DATA_FILE = 'robots.json';

router.get('/', (req, res) => {
  const robots = readData(DATA_FILE);
  res.json(robots);
});

router.get('/:id', (req, res) => {
  const robots = readData(DATA_FILE);
  const robot = robots.find(r => r.id === req.params.id);
  if (!robot) {
    return res.status(404).json({ error: '机器人不存在' });
  }
  res.json(robot);
});

router.post('/', (req, res) => {
  const robots = readData(DATA_FILE);
  const newRobot = {
    id: `robot-${generateId().substring(0, 8)}`,
    name: req.body.name,
    description: req.body.description || '',
    status: req.body.status || 'offline',
    type: req.body.type || 'web',
    host: req.body.host || 'localhost',
    port: req.body.port || 9222,
    lastHeartbeat: null,
    cpuUsage: 0,
    memoryUsage: 0,
    assignedWorkflows: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  robots.unshift(newRobot);
  writeData(DATA_FILE, robots);
  res.status(201).json(newRobot);
});

router.put('/:id', (req, res) => {
  const robots = readData(DATA_FILE);
  const index = robots.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '机器人不存在' });
  }
  robots[index] = {
    ...robots[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  writeData(DATA_FILE, robots);
  res.json(robots[index]);
});

router.delete('/:id', (req, res) => {
  const robots = readData(DATA_FILE);
  const index = robots.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '机器人不存在' });
  }
  robots.splice(index, 1);
  writeData(DATA_FILE, robots);
  res.json({ success: true, message: '机器人已删除' });
});

router.post('/:id/heartbeat', (req, res) => {
  const robots = readData(DATA_FILE);
  const index = robots.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '机器人不存在' });
  }
  robots[index].status = 'online';
  robots[index].lastHeartbeat = new Date().toISOString();
  if (req.body.cpuUsage !== undefined) {
    robots[index].cpuUsage = req.body.cpuUsage;
  }
  if (req.body.memoryUsage !== undefined) {
    robots[index].memoryUsage = req.body.memoryUsage;
  }
  robots[index].updatedAt = new Date().toISOString();
  writeData(DATA_FILE, robots);
  res.json(robots[index]);
});

router.post('/:id/assign-workflow', (req, res) => {
  const robots = readData(DATA_FILE);
  const index = robots.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '机器人不存在' });
  }
  const workflowId = req.body.workflowId;
  if (!workflowId) {
    return res.status(400).json({ error: '缺少 workflowId' });
  }
  if (!robots[index].assignedWorkflows.includes(workflowId)) {
    robots[index].assignedWorkflows.push(workflowId);
    robots[index].updatedAt = new Date().toISOString();
    writeData(DATA_FILE, robots);
  }
  res.json(robots[index]);
});

router.post('/:id/remove-workflow', (req, res) => {
  const robots = readData(DATA_FILE);
  const index = robots.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '机器人不存在' });
  }
  const workflowId = req.body.workflowId;
  if (!workflowId) {
    return res.status(400).json({ error: '缺少 workflowId' });
  }
  robots[index].assignedWorkflows = robots[index].assignedWorkflows.filter(
    id => id !== workflowId
  );
  robots[index].updatedAt = new Date().toISOString();
  writeData(DATA_FILE, robots);
  res.json(robots[index]);
});

module.exports = router;
