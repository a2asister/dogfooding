const express = require('express');
const router = express.Router();
const { readData, writeData, generateId } = require('../utils/dataStore');

const DATA_FILE = 'workflows.json';

router.get('/', (req, res) => {
  const workflows = readData(DATA_FILE);
  res.json(workflows);
});

router.get('/:id', (req, res) => {
  const workflows = readData(DATA_FILE);
  const workflow = workflows.find(w => w.id === req.params.id);
  if (!workflow) {
    return res.status(404).json({ error: '流程不存在' });
  }
  res.json(workflow);
});

router.post('/', (req, res) => {
  const workflows = readData(DATA_FILE);
  const newWorkflow = {
    id: `wf-${generateId().substring(0, 8)}`,
    name: req.body.name,
    description: req.body.description || '',
    status: req.body.status || 'draft',
    type: req.body.type || 'web',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: req.body.nodes || [
      { id: 'node-1', type: 'start', x: 100, y: 200, label: '开始' },
      { id: 'node-2', type: 'end', x: 300, y: 200, label: '结束' }
    ],
    edges: req.body.edges || [
      { id: 'e1-2', source: 'node-1', target: 'node-2' }
    ],
    variables: req.body.variables || {},
    retryConfig: req.body.retryConfig || {
      enabled: true,
      maxRetries: 3,
      retryDelay: 2000
    }
  };
  workflows.unshift(newWorkflow);
  writeData(DATA_FILE, workflows);
  res.status(201).json(newWorkflow);
});

router.put('/:id', (req, res) => {
  const workflows = readData(DATA_FILE);
  const index = workflows.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '流程不存在' });
  }
  workflows[index] = {
    ...workflows[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  writeData(DATA_FILE, workflows);
  res.json(workflows[index]);
});

router.delete('/:id', (req, res) => {
  const workflows = readData(DATA_FILE);
  const index = workflows.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '流程不存在' });
  }
  workflows.splice(index, 1);
  writeData(DATA_FILE, workflows);
  res.json({ success: true, message: '流程已删除' });
});

router.post('/:id/run', (req, res) => {
  const workflows = readData(DATA_FILE);
  const workflow = workflows.find(w => w.id === req.params.id);
  if (!workflow) {
    return res.status(404).json({ error: '流程不存在' });
  }
  const executions = readData('executions.json');
  const newExecution = {
    id: `exec-${generateId().substring(0, 8)}`,
    workflowId: workflow.id,
    robotId: req.body.robotId,
    name: workflow.name,
    status: 'running',
    type: 'manual',
    startTime: new Date().toISOString(),
    endTime: null,
    duration: null,
    logs: [{
      timestamp: new Date().toISOString(),
      level: 'info',
      message: '流程执行开始'
    }],
    steps: [],
    createdAt: new Date().toISOString()
  };
  executions.unshift(newExecution);
  writeData('executions.json', executions);
  res.status(201).json(newExecution);
});

module.exports = router;
