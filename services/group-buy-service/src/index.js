const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { isBefore, isAfter, format, addHours } = require('date-fns');

const app = express();
const PORT = 3004;

const DATA_DIR = path.join(__dirname, '../../data');
const GROUP_BUY_FILE = path.join(DATA_DIR, 'group-buys.json');
const GROUPS_FILE = path.join(DATA_DIR, 'groups.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultGroupBuys = [
  {
    id: uuidv4(),
    name: 'iPhone 15 Pro 三人团',
    productId: 'prod_001',
    productName: 'iPhone 15 Pro 128GB',
    productImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20smartphone%20product%20photo&image_size=square',
    originalPrice: 7999,
    groupPrice: 6999,
    groupSize: 3,
    maxGroups: 100,
    totalStock: 300,
    soldStock: 45,
    status: 'active',
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: '三人成团立省1000元！年度旗舰，钛金属边框，A17 Pro芯片',
    category: '手机数码',
    sortOrder: 1,
    isHot: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'AirPods Pro 2 双人团',
    productId: 'prod_002',
    productName: 'AirPods Pro 2 降噪耳机',
    productImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AirPods%20Pro%20wireless%20earbuds%20product%20photo&image_size=square',
    originalPrice: 1899,
    groupPrice: 1399,
    groupSize: 2,
    maxGroups: 200,
    totalStock: 400,
    soldStock: 128,
    status: 'active',
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    description: '两人成团立省500元！主动降噪，空间音频，H2芯片',
    category: '手机数码',
    sortOrder: 2,
    isHot: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'MacBook Pro 五人团',
    productId: 'prod_003',
    productName: 'MacBook Pro 14英寸 M3 Pro',
    productImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=MacBook%20Pro%20laptop%20product%20photo&image_size=square',
    originalPrice: 14999,
    groupPrice: 12999,
    groupSize: 5,
    maxGroups: 50,
    totalStock: 250,
    soldStock: 0,
    status: 'scheduled',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: '五人成团立省2000元！M3 Pro芯片，18小时续航',
    category: '电脑办公',
    sortOrder: 3,
    isHot: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const defaultGroups = [
  {
    id: uuidv4(),
    groupBuyId: defaultGroupBuys[0].id,
    leaderId: 'user_001',
    leaderName: '张三',
    members: [
      { userId: 'user_001', name: '张三', joinedAt: new Date().toISOString() }
    ],
    currentSize: 1,
    targetSize: 3,
    status: 'pending',
    expireAt: addHours(new Date(), 24).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    groupBuyId: defaultGroupBuys[0].id,
    leaderId: 'user_002',
    leaderName: '李四',
    members: [
      { userId: 'user_002', name: '李四', joinedAt: new Date().toISOString() },
      { userId: 'user_003', name: '王五', joinedAt: new Date().toISOString() }
    ],
    currentSize: 2,
    targetSize: 3,
    status: 'pending',
    expireAt: addHours(new Date(), 12).toISOString(),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: uuidv4(),
    groupBuyId: defaultGroupBuys[1].id,
    leaderId: 'user_004',
    leaderName: '赵六',
    members: [
      { userId: 'user_004', name: '赵六', joinedAt: new Date().toISOString() },
      { userId: 'user_005', name: '钱七', joinedAt: new Date().toISOString() }
    ],
    currentSize: 2,
    targetSize: 2,
    status: 'success',
    expireAt: addHours(new Date(), 6).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];

if (!fs.existsSync(GROUP_BUY_FILE)) {
  fs.writeFileSync(GROUP_BUY_FILE, JSON.stringify(defaultGroupBuys, null, 2));
}

if (!fs.existsSync(GROUPS_FILE)) {
  fs.writeFileSync(GROUPS_FILE, JSON.stringify(defaultGroups, null, 2));
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
        service: 'group-buy-service',
        level,
        message,
        metadata
      })
    });
  } catch (error) {
    console.error('Log service unavailable:', error.message);
  }
};

const readGroupBuys = () => {
  try {
    const data = fs.readFileSync(GROUP_BUY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return defaultGroupBuys;
  }
};

const writeGroupBuys = (items) => {
  fs.writeFileSync(GROUP_BUY_FILE, JSON.stringify(items, null, 2));
};

const readGroups = () => {
  try {
    const data = fs.readFileSync(GROUPS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return defaultGroups;
  }
};

const writeGroups = (groups) => {
  fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2));
};

const calculateStatus = (item) => {
  const now = new Date();
  const start = new Date(item.startTime);
  const end = new Date(item.endTime);

  if (isBefore(now, start)) return 'scheduled';
  if (isAfter(now, end)) return 'ended';
  return 'active';
};

app.get('/api/group-buys', (req, res) => {
  try {
    const { status, category, keyword, limit = 20, offset = 0 } = req.query;
    let items = readGroupBuys();

    items = items.map(item => ({
      ...item,
      status: calculateStatus(item),
      discountPercent: Math.round((1 - item.groupPrice / item.originalPrice) * 100),
      formattedStartTime: format(new Date(item.startTime), 'yyyy-MM-dd HH:mm:ss'),
      formattedEndTime: format(new Date(item.endTime), 'yyyy-MM-dd HH:mm:ss')
    }));

    if (status) {
      items = items.filter(item => item.status === status);
    }

    if (category) {
      items = items.filter(item => item.category === category);
    }

    if (keyword) {
      const kw = keyword.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(kw) || 
        item.productName.toLowerCase().includes(kw)
      );
    }

    items.sort((a, b) => a.sortOrder - b.sortOrder);

    const total = items.length;
    const paginated = items.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    log('info', '获取拼团列表成功', { count: paginated.length });

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
    log('error', '获取拼团列表失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/group-buys/active', (req, res) => {
  try {
    let items = readGroupBuys();

    items = items
      .map(item => ({
        ...item,
        status: calculateStatus(item),
        discountPercent: Math.round((1 - item.groupPrice / item.originalPrice) * 100),
        formattedStartTime: format(new Date(item.startTime), 'yyyy-MM-dd HH:mm:ss'),
        formattedEndTime: format(new Date(item.endTime), 'yyyy-MM-dd HH:mm:ss')
      }))
      .filter(item => item.status === 'active' || item.status === 'scheduled')
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const hotItems = items.filter(item => item.isHot);

    log('info', '获取当前活跃拼团', { hot: hotItems.length, all: items.length });

    res.json({
      success: true,
      data: {
        hot: hotItems,
        all: items
      }
    });
  } catch (error) {
    log('error', '获取活跃拼团失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/group-buys/:id', (req, res) => {
  try {
    const { id } = req.params;
    const items = readGroupBuys();
    const item = items.find(i => i.id === id);

    if (!item) {
      log('warn', '拼团商品不存在', { id });
      return res.status(404).json({ error: 'Group buy not found' });
    }

    const enrichedItem = {
      ...item,
      status: calculateStatus(item),
      discountPercent: Math.round((1 - item.groupPrice / item.originalPrice) * 100),
      formattedStartTime: format(new Date(item.startTime), 'yyyy-MM-dd HH:mm:ss'),
      formattedEndTime: format(new Date(item.endTime), 'yyyy-MM-dd HH:mm:ss')
    };

    const groups = readGroups()
      .filter(g => g.groupBuyId === id)
      .map(g => ({
        ...g,
        formattedExpireAt: format(new Date(g.expireAt), 'yyyy-MM-dd HH:mm:ss')
      }));

    log('info', '获取拼团详情成功', { id, name: item.name });
    res.json({ 
      success: true, 
      data: {
        ...enrichedItem,
        activeGroups: groups
      }
    });
  } catch (error) {
    log('error', '获取拼团详情失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/group-buys/:id/create-group', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const items = readGroupBuys();
    const item = items.find(i => i.id === id);

    if (!item) {
      return res.status(404).json({ error: 'Group buy not found' });
    }

    const status = calculateStatus(item);
    if (status !== 'active') {
      return res.status(400).json({ error: 'Group buy is not active' });
    }

    const groups = readGroups();
    const newGroup = {
      id: uuidv4(),
      groupBuyId: id,
      leaderId: userId,
      leaderName: userName || '匿名用户',
      members: [
        { userId, name: userName || '匿名用户', joinedAt: new Date().toISOString() }
      ],
      currentSize: 1,
      targetSize: item.groupSize,
      status: 'pending',
      expireAt: addHours(new Date(), 24).toISOString(),
      createdAt: new Date().toISOString()
    };

    groups.push(newGroup);
    writeGroups(groups);

    log('info', '创建拼团成功', { 
      groupId: newGroup.id, 
      groupBuyId: id,
      userId 
    });

    res.status(201).json({ 
      success: true, 
      data: newGroup,
      message: 'Group created successfully'
    });
  } catch (error) {
    log('error', '创建拼团失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/group-buys/:id/join-group/:groupId', (req, res) => {
  try {
    const { id, groupId } = req.params;
    const { userId, userName } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const groups = readGroups();
    const groupIndex = groups.findIndex(g => g.id === groupId && g.groupBuyId === id);

    if (groupIndex === -1) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const group = groups[groupIndex];

    if (group.status !== 'pending') {
      return res.status(400).json({ error: 'Group is not available for joining' });
    }

    if (group.currentSize >= group.targetSize) {
      return res.status(400).json({ error: 'Group is full' });
    }

    const isMember = group.members.some(m => m.userId === userId);
    if (isMember) {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }

    group.members.push({
      userId,
      name: userName || '匿名用户',
      joinedAt: new Date().toISOString()
    });
    group.currentSize += 1;

    if (group.currentSize >= group.targetSize) {
      group.status = 'success';
    }

    groups[groupIndex] = group;
    writeGroups(groups);

    log('info', '加入拼团成功', { 
      groupId, 
      groupBuyId: id,
      userId,
      newSize: group.currentSize
    });

    res.json({ 
      success: true, 
      data: group,
      message: group.status === 'success' ? 'Group completed successfully!' : 'Joined group successfully'
    });
  } catch (error) {
    log('error', '加入拼团失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/groups/:groupId', (req, res) => {
  try {
    const { groupId } = req.params;
    const groups = readGroups();
    const group = groups.find(g => g.id === groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const enrichedGroup = {
      ...group,
      formattedExpireAt: format(new Date(group.expireAt), 'yyyy-MM-dd HH:mm:ss'),
      formattedCreatedAt: format(new Date(group.createdAt), 'yyyy-MM-dd HH:mm:ss')
    };

    log('info', '获取拼团详情成功', { groupId });
    res.json({ success: true, data: enrichedGroup });
  } catch (error) {
    log('error', '获取拼团详情失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/groups/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 20, offset = 0 } = req.query;

    let groups = readGroups()
      .filter(g => g.members.some(m => m.userId === userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (status) {
      groups = groups.filter(g => g.status === status);
    }

    const total = groups.length;
    const paginated = groups.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    log('info', '获取用户拼团列表', { userId, count: paginated.length });

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
    log('error', '获取用户拼团列表失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`拼团服务运行在 http://localhost:${PORT}`);
});
