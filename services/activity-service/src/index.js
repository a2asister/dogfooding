const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { isBefore, isAfter, isEqual, format } = require('date-fns');

const app = express();
const PORT = 3002;

const DATA_DIR = path.join(__dirname, '../../data');
const ACTIVITY_FILE = path.join(DATA_DIR, 'activities.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultActivities = [
  {
    id: uuidv4(),
    name: '618年中大促',
    type: 'promotion',
    description: '全场商品低至5折起，限时抢购',
    status: 'active',
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    banner: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=618%20shopping%20festival%20banner%20with%20discounts%20and%20fireworks&image_size=landscape_16_9',
    rules: {
      minOrderAmount: 100,
      maxDiscount: 500,
      applicableCategories: ['all']
    },
    priority: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: '新用户专享',
    type: 'new_user',
    description: '新用户注册即送100元优惠券大礼包',
    status: 'active',
    startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    banner: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=welcome%20new%20user%20gift%20box%20promotion%20banner&image_size=landscape_16_9',
    rules: {
      newUserOnly: true,
      couponValue: 100,
      validDays: 30
    },
    priority: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: '会员日特惠',
    type: 'member',
    description: '每月18号会员专享85折优惠',
    status: 'scheduled',
    startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    banner: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vip%20member%20exclusive%20sale%20golden%20badge%20banner&image_size=landscape_16_9',
    rules: {
      memberOnly: true,
      discount: 0.15,
      maxDiscount: 200
    },
    priority: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

if (!fs.existsSync(ACTIVITY_FILE)) {
  fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(defaultActivities, null, 2));
}

app.use(cors());
app.use(express.json());

const logServiceUrl = 'http://localhost:3001/api/logs';

const log = async (level, message, metadata = {}) => {
  try {
    await fetch(logServiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'activity-service',
        level,
        message,
        metadata
      })
    });
  } catch (error) {
    console.error('Log service unavailable:', error.message);
  }
};

const readActivities = () => {
  try {
    const data = fs.readFileSync(ACTIVITY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return defaultActivities;
  }
};

const writeActivities = (activities) => {
  fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(activities, null, 2));
};

const calculateStatus = (activity) => {
  const now = new Date();
  const start = new Date(activity.startTime);
  const end = new Date(activity.endTime);

  if (isBefore(now, start)) return 'scheduled';
  if (isAfter(now, end)) return 'ended';
  return 'active';
};

app.get('/api/activities', (req, res) => {
  try {
    const { type, status, keyword, limit = 20, offset = 0 } = req.query;
    let activities = readActivities();

    activities = activities.map(a => ({
      ...a,
      status: calculateStatus(a),
      formattedStartTime: format(new Date(a.startTime), 'yyyy-MM-dd HH:mm:ss'),
      formattedEndTime: format(new Date(a.endTime), 'yyyy-MM-dd HH:mm:ss')
    }));

    if (type) {
      activities = activities.filter(a => a.type === type);
    }

    if (status) {
      activities = activities.filter(a => a.status === status);
    }

    if (keyword) {
      const kw = keyword.toLowerCase();
      activities = activities.filter(a => 
        a.name.toLowerCase().includes(kw) || 
        a.description.toLowerCase().includes(kw)
      );
    }

    activities.sort((a, b) => a.priority - b.priority);

    const total = activities.length;
    const paginated = activities.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    log('info', '获取活动列表成功', { 
      filters: { type, status, keyword },
      count: paginated.length 
    });

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    log('error', '获取活动列表失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/activities/:id', (req, res) => {
  try {
    const { id } = req.params;
    const activities = readActivities();
    const activity = activities.find(a => a.id === id);

    if (!activity) {
      log('warn', '活动不存在', { id });
      return res.status(404).json({ error: 'Activity not found' });
    }

    const enrichedActivity = {
      ...activity,
      status: calculateStatus(activity),
      formattedStartTime: format(new Date(activity.startTime), 'yyyy-MM-dd HH:mm:ss'),
      formattedEndTime: format(new Date(activity.endTime), 'yyyy-MM-dd HH:mm:ss')
    };

    log('info', '获取活动详情成功', { id, name: activity.name });
    res.json({ success: true, data: enrichedActivity });
  } catch (error) {
    log('error', '获取活动详情失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/activities', (req, res) => {
  try {
    const { 
      name, 
      type, 
      description, 
      startTime, 
      endTime, 
      banner, 
      rules, 
      priority 
    } = req.body;

    if (!name || !type || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const activities = readActivities();
    const newActivity = {
      id: uuidv4(),
      name,
      type,
      description: description || '',
      status: 'draft',
      startTime,
      endTime,
      banner: banner || '',
      rules: rules || {},
      priority: priority || 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    activities.push(newActivity);
    writeActivities(activities);

    log('info', '创建活动成功', { id: newActivity.id, name: newActivity.name });
    res.status(201).json({ success: true, data: newActivity });
  } catch (error) {
    log('error', '创建活动失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/activities/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const activities = readActivities();
    
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) {
      log('warn', '更新活动失败 - 活动不存在', { id });
      return res.status(404).json({ error: 'Activity not found' });
    }

    activities[index] = {
      ...activities[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    writeActivities(activities);
    log('info', '更新活动成功', { id, updates: Object.keys(updates) });
    res.json({ success: true, data: activities[index] });
  } catch (error) {
    log('error', '更新活动失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/activities/:id', (req, res) => {
  try {
    const { id } = req.params;
    let activities = readActivities();
    
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) {
      log('warn', '删除活动失败 - 活动不存在', { id });
      return res.status(404).json({ error: 'Activity not found' });
    }

    const deletedActivity = activities[index];
    activities.splice(index, 1);
    writeActivities(activities);

    log('info', '删除活动成功', { id, name: deletedActivity.name });
    res.json({ success: true });
  } catch (error) {
    log('error', '删除活动失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/activities/active/current', (req, res) => {
  try {
    const activities = readActivities();
    const activeActivities = activities
      .map(a => ({ ...a, status: calculateStatus(a) }))
      .filter(a => a.status === 'active')
      .sort((a, b) => a.priority - b.priority);

    log('info', '获取当前活跃活动', { count: activeActivities.length });
    res.json({ success: true, data: activeActivities });
  } catch (error) {
    log('error', '获取当前活跃活动失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`活动配置服务运行在 http://localhost:${PORT}`);
});
