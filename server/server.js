const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 58765; // 不常用端口号

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 数据文件路径
const dataPath = path.join(__dirname, 'data');
const configPath = path.join(dataPath, 'danmaku-config.json');
const blockedWordsPath = path.join(dataPath, 'blocked-words.json');
const syncPath = path.join(dataPath, 'sync-data.json');

// 确保数据目录存在
fs.ensureDirSync(dataPath);

// 初始化配置文件
const defaultConfig = {
  fontSize: 24,
  speed: 5,
  color: '#ffffff',
  opacity: 0.9,
  fontFamily: 'Microsoft YaHei, sans-serif'
};

const defaultBlockedWords = [];
const defaultSyncData = {
  lastSync: null,
  devices: []
};

// 读取数据
function readConfig() {
  if (fs.existsSync(configPath)) {
    return fs.readJsonSync(configPath);
  }
  fs.writeJsonSync(configPath, defaultConfig, { spaces: 2 });
  return defaultConfig;
}

function readBlockedWords() {
  if (fs.existsSync(blockedWordsPath)) {
    return fs.readJsonSync(blockedWordsPath);
  }
  fs.writeJsonSync(blockedWordsPath, defaultBlockedWords, { spaces: 2 });
  return defaultBlockedWords;
}

function readSyncData() {
  if (fs.existsSync(syncPath)) {
    return fs.readJsonSync(syncPath);
  }
  fs.writeJsonSync(syncPath, defaultSyncData, { spaces: 2 });
  return defaultSyncData;
}

// 保存数据
function saveConfig(config) {
  fs.writeJsonSync(configPath, config, { spaces: 2 });
}

function saveBlockedWords(words) {
  fs.writeJsonSync(blockedWordsPath, words, { spaces: 2 });
}

function saveSyncData(data) {
  fs.writeJsonSync(syncPath, data, { spaces: 2 });
}

// API路由

// 获取弹幕配置
app.get('/api/config', (req, res) => {
  try {
    const config = readConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取配置失败' });
  }
});

// 更新弹幕配置
app.put('/api/config', (req, res) => {
  try {
    const config = readConfig();
    const newConfig = { ...config, ...req.body };
    saveConfig(newConfig);
    res.json({ success: true, data: newConfig, message: '配置已更新' });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新配置失败' });
  }
});

// 获取屏蔽词列表
app.get('/api/blocked-words', (req, res) => {
  try {
    const words = readBlockedWords();
    res.json({ success: true, data: words });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取屏蔽词列表失败' });
  }
});

// 添加屏蔽词
app.post('/api/blocked-words', (req, res) => {
  try {
    const { word } = req.body;
    if (!word || word.trim() === '') {
      return res.status(400).json({ success: false, message: '屏蔽词不能为空' });
    }
    
    const words = readBlockedWords();
    if (words.includes(word.trim())) {
      return res.status(400).json({ success: false, message: '该屏蔽词已存在' });
    }
    
    words.push(word.trim());
    saveBlockedWords(words);
    res.json({ success: true, data: words, message: '屏蔽词已添加' });
  } catch (error) {
    res.status(500).json({ success: false, message: '添加屏蔽词失败' });
  }
});

// 删除屏蔽词
app.delete('/api/blocked-words/:word', (req, res) => {
  try {
    const { word } = req.params;
    const words = readBlockedWords();
    const index = words.indexOf(word);
    
    if (index === -1) {
      return res.status(404).json({ success: false, message: '屏蔽词不存在' });
    }
    
    words.splice(index, 1);
    saveBlockedWords(words);
    res.json({ success: true, data: words, message: '屏蔽词已删除' });
  } catch (error) {
    res.status(500).json({ success: false, message: '删除屏蔽词失败' });
  }
});

// 批量更新屏蔽词
app.put('/api/blocked-words', (req, res) => {
  try {
    const { words } = req.body;
    if (!Array.isArray(words)) {
      return res.status(400).json({ success: false, message: '屏蔽词必须是数组格式' });
    }
    
    // 去重并过滤空值
    const uniqueWords = [...new Set(words.filter(word => word && word.trim()))];
    saveBlockedWords(uniqueWords);
    res.json({ success: true, data: uniqueWords, message: '屏蔽词已更新' });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新屏蔽词失败' });
  }
});

// 云同步 - 获取同步数据
app.get('/api/sync', (req, res) => {
  try {
    const syncData = readSyncData();
    const config = readConfig();
    const blockedWords = readBlockedWords();
    
    const fullSyncData = {
      lastSync: syncData.lastSync,
      config: config,
      blockedWords: blockedWords
    };
    
    res.json({ success: true, data: fullSyncData });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取同步数据失败' });
  }
});

// 云同步 - 上传同步数据
app.post('/api/sync', (req, res) => {
  try {
    const { config, blockedWords, deviceId } = req.body;
    const syncData = readSyncData();
    
    // 更新配置
    if (config) {
      saveConfig(config);
    }
    
    // 更新屏蔽词
    if (blockedWords) {
      saveBlockedWords(blockedWords);
    }
    
    // 更新同步记录
    syncData.lastSync = new Date().toISOString();
    if (deviceId && !syncData.devices.includes(deviceId)) {
      syncData.devices.push(deviceId);
    }
    saveSyncData(syncData);
    
    res.json({ 
      success: true, 
      data: {
        lastSync: syncData.lastSync,
        config: config || readConfig(),
        blockedWords: blockedWords || readBlockedWords()
      },
      message: '同步成功' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '同步失败' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '弹幕配置服务运行中', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`弹幕配置服务已启动，端口: ${PORT}`);
  console.log(`API地址: http://localhost:${PORT}/api`);
  console.log(`配置页面: http://localhost:${PORT}`);
});
