const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 18765;
const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'todo-data.json');

app.use(cors());
app.use(bodyParser.json());

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getDefaultData = () => ({
  folders: [
    {
      id: 'folder-1',
      name: '工作',
      color: '#667eea',
      createdAt: new Date().toISOString()
    },
    {
      id: 'folder-2',
      name: '学习',
      color: '#764ba2',
      createdAt: new Date().toISOString()
    },
    {
      id: 'folder-3',
      name: '生活',
      color: '#f093fb',
      createdAt: new Date().toISOString()
    }
  ],
  lists: [
    {
      id: 'list-1',
      folderId: 'folder-1',
      name: '项目开发',
      createdAt: new Date().toISOString()
    },
    {
      id: 'list-2',
      folderId: 'folder-1',
      name: '会议安排',
      createdAt: new Date().toISOString()
    },
    {
      id: 'list-3',
      folderId: 'folder-2',
      name: '课程学习',
      createdAt: new Date().toISOString()
    },
    {
      id: 'list-4',
      folderId: 'folder-3',
      name: '日常事务',
      createdAt: new Date().toISOString()
    }
  ],
  tasks: [
    {
      id: 'task-1',
      listId: 'list-1',
      title: '完成项目需求文档',
      description: '撰写详细的项目需求分析文档',
      priority: 'urgent',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      isCompleted: false,
      isRepeating: false,
      repeatPattern: null,
      createdAt: new Date().toISOString(),
      completedAt: null
    },
    {
      id: 'task-2',
      listId: 'list-1',
      title: '代码审查',
      description: '审查团队成员的提交代码',
      priority: 'important',
      dueDate: new Date(Date.now() + 172800000).toISOString(),
      isCompleted: false,
      isRepeating: true,
      repeatPattern: 'daily',
      createdAt: new Date().toISOString(),
      completedAt: null
    },
    {
      id: 'task-3',
      listId: 'list-2',
      title: '周例会准备',
      description: '准备周例会的演示材料',
      priority: 'normal',
      dueDate: null,
      isCompleted: true,
      isRepeating: false,
      repeatPattern: null,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    },
    {
      id: 'task-4',
      listId: 'list-3',
      title: '学习 Vue 3 组合式 API',
      description: '完成 Vue 3 官方教程',
      priority: 'important',
      dueDate: new Date(Date.now() + 259200000).toISOString(),
      isCompleted: false,
      isRepeating: false,
      repeatPattern: null,
      createdAt: new Date().toISOString(),
      completedAt: null
    },
    {
      id: 'task-5',
      listId: 'list-4',
      title: '健身',
      description: '每周三次健身计划',
      priority: 'normal',
      dueDate: null,
      isCompleted: false,
      isRepeating: true,
      repeatPattern: 'weekly',
      createdAt: new Date().toISOString(),
      completedAt: null
    }
  ]
});

const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    const defaultData = getDefaultData();
    saveData(defaultData);
    return defaultData;
  } catch (error) {
    console.error('Error loading data:', error);
    return getDefaultData();
  }
};

const saveData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

app.get('/api/data', (req, res) => {
  const data = loadData();
  res.json(data);
});

app.get('/api/folders', (req, res) => {
  const data = loadData();
  res.json(data.folders);
});

app.post('/api/folders', (req, res) => {
  const data = loadData();
  const newFolder = {
    id: generateId('folder'),
    name: req.body.name,
    color: req.body.color || '#667eea',
    createdAt: new Date().toISOString()
  };
  data.folders.push(newFolder);
  saveData(data);
  res.json(newFolder);
});

app.put('/api/folders/:id', (req, res) => {
  const data = loadData();
  const index = data.folders.findIndex(f => f.id === req.params.id);
  if (index !== -1) {
    data.folders[index] = { ...data.folders[index], ...req.body };
    saveData(data);
    res.json(data.folders[index]);
  } else {
    res.status(404).json({ error: 'Folder not found' });
  }
});

app.delete('/api/folders/:id', (req, res) => {
  const data = loadData();
  const folderId = req.params.id;
  data.folders = data.folders.filter(f => f.id !== folderId);
  data.lists = data.lists.filter(l => l.folderId !== folderId);
  const listIds = data.lists.filter(l => l.folderId === folderId).map(l => l.id);
  data.tasks = data.tasks.filter(t => !listIds.includes(t.listId));
  saveData(data);
  res.json({ success: true });
});

app.get('/api/lists', (req, res) => {
  const data = loadData();
  const { folderId } = req.query;
  let lists = data.lists;
  if (folderId) {
    lists = lists.filter(l => l.folderId === folderId);
  }
  res.json(lists);
});

app.post('/api/lists', (req, res) => {
  const data = loadData();
  const newList = {
    id: generateId('list'),
    folderId: req.body.folderId,
    name: req.body.name,
    createdAt: new Date().toISOString()
  };
  data.lists.push(newList);
  saveData(data);
  res.json(newList);
});

app.put('/api/lists/:id', (req, res) => {
  const data = loadData();
  const index = data.lists.findIndex(l => l.id === req.params.id);
  if (index !== -1) {
    data.lists[index] = { ...data.lists[index], ...req.body };
    saveData(data);
    res.json(data.lists[index]);
  } else {
    res.status(404).json({ error: 'List not found' });
  }
});

app.delete('/api/lists/:id', (req, res) => {
  const data = loadData();
  const listId = req.params.id;
  data.lists = data.lists.filter(l => l.id !== listId);
  data.tasks = data.tasks.filter(t => t.listId !== listId);
  saveData(data);
  res.json({ success: true });
});

app.get('/api/tasks', (req, res) => {
  const data = loadData();
  const { listId, folderId, isCompleted, priority } = req.query;
  let tasks = data.tasks;
  
  if (listId) {
    tasks = tasks.filter(t => t.listId === listId);
  }
  
  if (folderId) {
    const listIds = data.lists.filter(l => l.folderId === folderId).map(l => l.id);
    tasks = tasks.filter(t => listIds.includes(t.listId));
  }
  
  if (isCompleted !== undefined) {
    tasks = tasks.filter(t => t.isCompleted === (isCompleted === 'true'));
  }
  
  if (priority) {
    tasks = tasks.filter(t => t.priority === priority);
  }
  
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const data = loadData();
  const newTask = {
    id: generateId('task'),
    listId: req.body.listId,
    title: req.body.title,
    description: req.body.description || '',
    priority: req.body.priority || 'normal',
    dueDate: req.body.dueDate || null,
    isCompleted: false,
    isRepeating: req.body.isRepeating || false,
    repeatPattern: req.body.repeatPattern || null,
    createdAt: new Date().toISOString(),
    completedAt: null
  };
  data.tasks.push(newTask);
  saveData(data);
  res.json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const data = loadData();
  const index = data.tasks.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    const updatedTask = { ...data.tasks[index], ...req.body };
    if (req.body.isCompleted && !data.tasks[index].isCompleted) {
      updatedTask.completedAt = new Date().toISOString();
    }
    data.tasks[index] = updatedTask;
    saveData(data);
    res.json(updatedTask);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const data = loadData();
  const taskId = req.params.id;
  data.tasks = data.tasks.filter(t => t.id !== taskId);
  saveData(data);
  res.json({ success: true });
});

app.get('/api/stats', (req, res) => {
  const data = loadData();
  const { period } = req.query;
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  
  const tasksInPeriod = data.tasks.filter(t => {
    const taskDate = new Date(t.createdAt);
    return taskDate >= startDate;
  });
  
  const completedTasks = tasksInPeriod.filter(t => t.isCompleted);
  const totalTasks = tasksInPeriod.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  
  const urgentTasks = tasksInPeriod.filter(t => t.priority === 'urgent');
  const importantTasks = tasksInPeriod.filter(t => t.priority === 'important');
  const normalTasks = tasksInPeriod.filter(t => t.priority === 'normal');
  
  res.json({
    total: totalTasks,
    completed: completedTasks.length,
    completionRate,
    byPriority: {
      urgent: urgentTasks.length,
      important: importantTasks.length,
      normal: normalTasks.length
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
