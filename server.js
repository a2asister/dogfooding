const fastify = require('fastify')({ logger: true });
const path = require('path');
const fs = require('fs-extra');

console.log('Server is starting...');
console.log('Current directory:', __dirname);

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'focus-data.json');

const initializeData = async () => {
  await fs.ensureDir(DATA_DIR);
  if (!await fs.pathExists(DATA_FILE)) {
    const initialData = {
      sessions: [],
      settings: {
        scenarios: [
          { id: 'study', name: '学习', color: '#667eea', secondaryColor: '#764ba2', duration: 45 },
          { id: 'work', name: '工作', color: '#f093fb', secondaryColor: '#f5576c', duration: 50 },
          { id: 'reading', name: '阅读', color: '#4facfe', secondaryColor: '#00f2fe', duration: 30 },
          { id: 'break', name: '休息', color: '#43e97b', secondaryColor: '#38f9d7', duration: 15 }
        ],
        currentScenario: 'study',
        theme: 'dark',
        whiteNoise: true,
        cycleMode: true,
        customDuration: 45,
        customBreakDuration: 15
      },
      badges: [],
      streak: 0
    };
    await fs.writeJson(DATA_FILE, initialData, { spaces: 2 });
  }
};

fastify.register(require('@fastify/cors'), {
  origin: true
});

fastify.get('/api/data', async (request, reply) => {
  try {
    const data = await fs.readJson(DATA_FILE);
    return data;
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to read data' });
  }
});

fastify.post('/api/session', async (request, reply) => {
  try {
    const { duration, scenario } = request.body;
    const data = await fs.readJson(DATA_FILE);
    
    const newSession = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      duration,
      scenario,
      completed: true
    };
    
    data.sessions.push(newSession);
    
    const today = new Date().toDateString();
    const lastSessionDate = data.sessions.length > 1 
      ? new Date(data.sessions[data.sessions.length - 2].timestamp).toDateString()
      : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastSessionDate === today) {
      // 今天已经记录过，不改变连续天数
    } else if (lastSessionDate === yesterday || !lastSessionDate) {
      data.streak += 1;
      
      const badgeChecks = [
        { id: 'first-day', name: '初次专注', condition: data.streak >= 1 },
        { id: 'three-days', name: '三日挑战', condition: data.streak >= 3 },
        { id: 'week', name: '一周坚持', condition: data.streak >= 7 },
        { id: 'fortnight', name: '半月达人', condition: data.streak >= 14 },
        { id: 'month', name: '月度之星', condition: data.streak >= 30 }
      ];
      
      badgeChecks.forEach(check => {
        if (check.condition && !data.badges.find(b => b.id === check.id)) {
          data.badges.push({
            id: check.id,
            name: check.name,
            earnedAt: new Date().toISOString()
          });
        }
      });
    } else {
      data.streak = 1;
    }
    
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    return { success: true, session: newSession, streak: data.streak, badges: data.badges };
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to save session' });
  }
});

fastify.put('/api/settings', async (request, reply) => {
  try {
    const newSettings = request.body;
    const data = await fs.readJson(DATA_FILE);
    data.settings = { ...data.settings, ...newSettings };
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    return { success: true, settings: data.settings };
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to update settings' });
  }
});

fastify.get('/api/stats/week', async (request, reply) => {
  try {
    const data = await fs.readJson(DATA_FILE);
    const lastWeek = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const daySessions = data.sessions.filter(session => 
        new Date(session.timestamp).toDateString() === dateStr && session.completed
      );
      
      const totalMinutes = daySessions.reduce((sum, session) => sum + session.duration, 0);
      
      lastWeek.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        minutes: totalMinutes
      });
    }
    
    return lastWeek;
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to get weekly stats' });
  }
});

fastify.get('/api/stats/month', async (request, reply) => {
  try {
    const data = await fs.readJson(DATA_FILE);
    const lastMonth = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const daySessions = data.sessions.filter(session => 
        new Date(session.timestamp).toDateString() === dateStr && session.completed
      );
      
      const totalMinutes = daySessions.reduce((sum, session) => sum + session.duration, 0);
      
      lastMonth.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        minutes: totalMinutes
      });
    }
    
    return lastMonth;
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: 'Failed to get monthly stats' });
  }
});

const start = async () => {
  try {
    await initializeData();
    await fastify.listen({ port: 3001 });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
