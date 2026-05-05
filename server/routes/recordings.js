const express = require('express');
const router = express.Router();
const { readData, writeData, generateId } = require('../utils/dataStore');

const DATA_FILE = 'recordings.json';

const recordingTypes = [
  { type: 'click', label: '点击', icon: '👆' },
  { type: 'type', label: '输入', icon: '⌨️' },
  { type: 'scroll', label: '滚动', icon: '📜' },
  { type: 'select', label: '选择', icon: '☑️' },
  { type: 'hover', label: '悬停', icon: '🖱️' },
  { type: 'navigate', label: '导航', icon: '🔗' },
  { type: 'wait', label: '等待', icon: '⏳' },
  { type: 'screenshot', label: '截图', icon: '📸' }
];

router.get('/types', (req, res) => {
  res.json(recordingTypes);
});

router.get('/', (req, res) => {
  const recordings = readData(DATA_FILE);
  res.json(recordings);
});

router.get('/:id', (req, res) => {
  const recordings = readData(DATA_FILE);
  const recording = recordings.find(r => r.id === req.params.id);
  if (!recording) {
    return res.status(404).json({ error: '录制记录不存在' });
  }
  res.json(recording);
});

router.post('/', (req, res) => {
  const recordings = readData(DATA_FILE);
  const newRecording = {
    id: `rec-${generateId().substring(0, 8)}`,
    name: req.body.name || '未命名录制',
    description: req.body.description || '',
    type: req.body.type || 'web',
    status: 'recording',
    url: req.body.url,
    title: req.body.title,
    steps: req.body.steps || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null
  };
  recordings.unshift(newRecording);
  writeData(DATA_FILE, recordings);
  res.status(201).json(newRecording);
});

router.post('/:id/step', (req, res) => {
  const recordings = readData(DATA_FILE);
  const index = recordings.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '录制记录不存在' });
  }
  
  const newStep = {
    id: `step-${generateId().substring(0, 6)}`,
    type: req.body.type,
    timestamp: new Date().toISOString(),
    x: req.body.x,
    y: req.body.y,
    selector: req.body.selector,
    value: req.body.value,
    text: req.body.text,
    tagName: req.body.tagName,
    className: req.body.className,
    id: req.body.id,
    href: req.body.href,
    title: req.body.title,
    screenshot: req.body.screenshot,
    metadata: req.body.metadata
  };
  
  recordings[index].steps.push(newStep);
  recordings[index].updatedAt = new Date().toISOString();
  writeData(DATA_FILE, recordings);
  
  res.json(newStep);
});

router.put('/:id', (req, res) => {
  const recordings = readData(DATA_FILE);
  const index = recordings.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '录制记录不存在' });
  }
  recordings[index] = {
    ...recordings[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  writeData(DATA_FILE, recordings);
  res.json(recordings[index]);
});

router.post('/:id/stop', (req, res) => {
  const recordings = readData(DATA_FILE);
  const index = recordings.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '录制记录不存在' });
  }
  
  recordings[index].status = 'completed';
  recordings[index].completedAt = new Date().toISOString();
  recordings[index].updatedAt = new Date().toISOString();
  writeData(DATA_FILE, recordings);
  
  res.json(recordings[index]);
});

router.post('/:id/convert-workflow', (req, res) => {
  const recordings = readData(DATA_FILE);
  const recording = recordings.find(r => r.id === req.params.id);
  if (!recording) {
    return res.status(404).json({ error: '录制记录不存在' });
  }
  
  const workflows = readData('workflows.json');
  
  const nodes = [];
  const edges = [];
  
  nodes.push({
    id: 'node-1',
    type: 'start',
    x: 100,
    y: 200,
    label: '开始'
  });
  
  let nodeIndex = 2;
  let lastNodeId = 'node-1';
  
  for (const step of recording.steps) {
    const nodeId = `node-${nodeIndex}`;
    let nodeType = 'action';
    let label = step.type;
    let config = {};
    
    switch (step.type) {
      case 'click':
        nodeType = 'click';
        label = `点击 ${step.text || step.tagName}`;
        config = {
          selector: step.selector
        };
        break;
      case 'type':
        nodeType = 'type';
        label = `输入: ${step.value?.substring(0, 20)}${step.value?.length > 20 ? '...' : ''}`;
        config = {
          selector: step.selector,
          value: step.value
        };
        break;
      case 'navigate':
        nodeType = 'navigate';
        label = `导航到 ${step.href || step.title}`;
        config = {
          url: step.href
        };
        break;
      case 'wait':
        nodeType = 'wait';
        label = '等待元素加载';
        config = {
          selector: step.selector,
          timeout: 10000
        };
        break;
      case 'screenshot':
        nodeType = 'screenshot';
        label = '截图';
        config = {
          selector: step.selector
        };
        break;
      case 'select':
        nodeType = 'select';
        label = `选择: ${step.value}`;
        config = {
          selector: step.selector,
          value: step.value
        };
        break;
      case 'scroll':
        nodeType = 'scroll';
        label = `滚动到 (${step.x}, ${step.y})`;
        config = {
          x: step.x,
          y: step.y
        };
        break;
    }
    
    nodes.push({
      id: nodeId,
      type: nodeType,
      x: 100 + (nodeIndex - 1) * 200,
      y: 200,
      label: label,
      config: config
    });
    
    edges.push({
      id: `e${lastNodeId}-${nodeId}`,
      source: lastNodeId,
      target: nodeId
    });
    
    lastNodeId = nodeId;
    nodeIndex++;
  }
  
  const endNodeId = `node-${nodeIndex}`;
  nodes.push({
    id: endNodeId,
    type: 'end',
    x: 100 + (nodeIndex - 1) * 200,
    y: 200,
    label: '结束'
  });
  
  edges.push({
    id: `e${lastNodeId}-${endNodeId}`,
    source: lastNodeId,
    target: endNodeId
  });
  
  const newWorkflow = {
    id: `wf-${generateId().substring(0, 8)}`,
    name: recording.name,
    description: `从录制转换: ${recording.description}`,
    status: 'draft',
    type: recording.type,
    sourceRecording: recording.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: nodes,
    edges: edges,
    variables: {},
    retryConfig: {
      enabled: true,
      maxRetries: 3,
      retryDelay: 2000
    }
  };
  
  workflows.unshift(newWorkflow);
  writeData('workflows.json', workflows);
  
  res.status(201).json(newWorkflow);
});

router.delete('/:id', (req, res) => {
  const recordings = readData(DATA_FILE);
  const index = recordings.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '录制记录不存在' });
  }
  recordings.splice(index, 1);
  writeData(DATA_FILE, recordings);
  res.json({ success: true, message: '录制记录已删除' });
});

module.exports = router;
