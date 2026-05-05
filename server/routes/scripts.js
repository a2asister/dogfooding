const express = require('express');
const router = express.Router();
const { readData, writeData, generateId } = require('../utils/dataStore');

const DATA_FILE = 'scripts.json';

router.get('/', (req, res) => {
  const scripts = readData(DATA_FILE);
  res.json(scripts);
});

router.get('/:id', (req, res) => {
  const scripts = readData(DATA_FILE);
  const script = scripts.find(s => s.id === req.params.id);
  if (!script) {
    return res.status(404).json({ error: '脚本不存在' });
  }
  res.json(script);
});

router.post('/', (req, res) => {
  const scripts = readData(DATA_FILE);
  const newScript = {
    id: `script-${generateId().substring(0, 8)}`,
    name: req.body.name,
    description: req.body.description || '',
    language: req.body.language || 'javascript',
    code: req.body.code || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usedBy: []
  };
  scripts.unshift(newScript);
  writeData(DATA_FILE, scripts);
  res.status(201).json(newScript);
});

router.put('/:id', (req, res) => {
  const scripts = readData(DATA_FILE);
  const index = scripts.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '脚本不存在' });
  }
  scripts[index] = {
    ...scripts[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  writeData(DATA_FILE, scripts);
  res.json(scripts[index]);
});

router.delete('/:id', (req, res) => {
  const scripts = readData(DATA_FILE);
  const index = scripts.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '脚本不存在' });
  }
  scripts.splice(index, 1);
  writeData(DATA_FILE, scripts);
  res.json({ success: true, message: '脚本已删除' });
});

router.post('/:id/execute', (req, res) => {
  const scripts = readData(DATA_FILE);
  const script = scripts.find(s => s.id === req.params.id);
  if (!script) {
    return res.status(404).json({ error: '脚本不存在' });
  }
  
  try {
    const result = {
      success: true,
      output: '脚本执行模拟完成',
      executionTime: 123,
      timestamp: new Date().toISOString()
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
