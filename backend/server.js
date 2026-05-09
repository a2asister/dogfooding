const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');

app.use(cors());
app.use(express.json());

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const readJsonFile = (filename, defaultData = {}) => {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const writeJsonFile = (filename, data) => {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const defaultHabits = [
  { id: '1', name: '早睡', icon: '🌙', color: '#6B5B95', reminder: '22:30', active: true },
  { id: '2', name: '运动', icon: '🏃', color: '#88B04B', reminder: '18:00', active: true },
  { id: '3', name: '学习', icon: '📚', color: '#92A8D1', reminder: '20:00', active: true },
  { id: '4', name: '喝水', icon: '💧', color: '#87CEEB', reminder: '', active: true },
];

app.get('/api/habits', (req, res) => {
  const habits = readJsonFile('habits.json', defaultHabits);
  res.json(habits);
});

app.post('/api/habits', (req, res) => {
  const habits = readJsonFile('habits.json', defaultHabits);
  const newHabit = {
    id: Date.now().toString(),
    ...req.body,
    active: true
  };
  habits.push(newHabit);
  writeJsonFile('habits.json', habits);
  res.json(newHabit);
});

app.put('/api/habits/:id', (req, res) => {
  const habits = readJsonFile('habits.json', defaultHabits);
  const index = habits.findIndex(h => h.id === req.params.id);
  if (index !== -1) {
    habits[index] = { ...habits[index], ...req.body };
    writeJsonFile('habits.json', habits);
    res.json(habits[index]);
  } else {
    res.status(404).json({ error: 'Habit not found' });
  }
});

app.delete('/api/habits/:id', (req, res) => {
  const habits = readJsonFile('habits.json', defaultHabits);
  const filtered = habits.filter(h => h.id !== req.params.id);
  writeJsonFile('habits.json', filtered);
  res.json({ success: true });
});

app.get('/api/records', (req, res) => {
  const records = readJsonFile('records.json', {});
  res.json(records);
});

app.get('/api/records/:date', (req, res) => {
  const records = readJsonFile('records.json', {});
  res.json(records[req.params.date] || []);
});

app.post('/api/records/:date', (req, res) => {
  const records = readJsonFile('records.json', {});
  const date = req.params.date;
  if (!records[date]) {
    records[date] = [];
  }
  const existingIndex = records[date].findIndex(r => r.habitId === req.body.habitId);
  if (existingIndex !== -1) {
    records[date][existingIndex] = { ...records[date][existingIndex], ...req.body };
  } else {
    records[date].push({
      id: Date.now().toString(),
      date,
      ...req.body
    });
  }
  writeJsonFile('records.json', records);
  res.json(records[date]);
});

app.delete('/api/records/:date/:habitId', (req, res) => {
  const records = readJsonFile('records.json', {});
  const date = req.params.date;
  if (records[date]) {
    records[date] = records[date].filter(r => r.habitId !== req.params.habitId);
    writeJsonFile('records.json', records);
  }
  res.json({ success: true });
});

app.get('/api/stats/week', (req, res) => {
  const records = readJsonFile('records.json', {});
  const habits = readJsonFile('habits.json', defaultHabits);
  const today = new Date();
  const weekData = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayRecords = records[dateStr] || [];
    const activeHabits = habits.filter(h => h.active);
    const completed = dayRecords.filter(r => r.completed).length;
    weekData.push({
      date: dateStr,
      total: activeHabits.length,
      completed
    });
  }
  
  res.json(weekData);
});

app.get('/api/stats/month', (req, res) => {
  const records = readJsonFile('records.json', {});
  const habits = readJsonFile('habits.json', defaultHabits);
  const today = new Date();
  const monthData = [];
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayRecords = records[dateStr] || [];
    const activeHabits = habits.filter(h => h.active);
    const completed = dayRecords.filter(r => r.completed).length;
    monthData.push({
      date: dateStr,
      total: activeHabits.length,
      completed
    });
  }
  
  res.json(monthData);
});

app.get('/api/stats/streak', (req, res) => {
  try {
    const records = readJsonFile('records.json', {});
    const habits = readJsonFile('habits.json', defaultHabits);
    const activeHabits = habits.filter(h => h.active);
    
    if (activeHabits.length === 0) {
      res.json({ current: 0, longest: 0 });
      return;
    }
    
    const today = new Date();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let maxDays = 365;
    
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    
    while (maxDays-- > 0) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const dayRecords = records[dateStr] || [];
      const allCompleted = activeHabits.every(h => 
        dayRecords.some(r => r.habitId === h.id && r.completed)
      );
      
      if (allCompleted) {
        currentStreak++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (tempStreak > 0) {
          break;
        }
      }
      
      date.setDate(date.getDate() - 1);
    }
    
    res.json({ current: currentStreak, longest: longestStreak });
  } catch (error) {
    console.error('Streak API error:', error);
    res.json({ current: 0, longest: 0 });
  }
});

app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
});
