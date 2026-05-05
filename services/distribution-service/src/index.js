const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { format, addDays } = require('date-fns');

const app = express();
const PORT = 3008;

const DATA_DIR = path.join(__dirname, '../../data');
const DISTRIBUTOR_FILE = path.join(DATA_DIR, 'distributors.json');
const DISTRIBUTION_RELATIONS_FILE = path.join(DATA_DIR, 'distribution-relations.json');
const DISTRIBUTION_COMMISSIONS_FILE = path.join(DATA_DIR, 'distribution-commissions.json');
const DISTRIBUTION_WITHDRAWALS_FILE = path.join(DATA_DIR, 'distribution-withdrawals.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultDistributors = [
  {
    id: uuidv4(),
    userId: 'user_001',
    level: 1,
    levelName: '初级分销商',
    status: 'active',
    joinTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    totalSales: 15680,
    totalCommission: 1568,
    withdrawableCommission: 1200,
    withdrawnCommission: 368,
    teamCount: 8,
    firstLevelCount: 5,
    secondLevelCount: 3,
    referralCode: 'REF123456',
    qrCodeUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=QR%20code%20with%20gradient%20border%20premium%20design&image_size=square',
    shareUrl: 'https://example.com/ref/REF123456',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const defaultRelations = [
  {
    id: uuidv4(),
    distributorId: defaultDistributors[0].id,
    userId: 'user_002',
    level: 1,
    parentDistributorId: null,
    status: 'active',
    bindTime: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    totalOrders: 12,
    totalAmount: 3560,
    createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    distributorId: defaultDistributors[0].id,
    userId: 'user_003',
    level: 1,
    parentDistributorId: null,
    status: 'active',
    bindTime: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    totalOrders: 8,
    totalAmount: 2100,
    createdAt: new Date().toISOString()
  }
];

const defaultCommissions = [
  {
    id: uuidv4(),
    distributorId: defaultDistributors[0].id,
    orderId: 'order_001',
    orderAmount: 500,
    commissionRate: 0.1,
    commissionAmount: 50,
    level: 1,
    status: 'settled',
    description: '一级分销佣金',
    relatedUserId: 'user_002',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    settledAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: uuidv4(),
    distributorId: defaultDistributors[0].id,
    orderId: 'order_002',
    orderAmount: 800,
    commissionRate: 0.1,
    commissionAmount: 80,
    level: 1,
    status: 'settled',
    description: '一级分销佣金',
    relatedUserId: 'user_003',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    settledAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: uuidv4(),
    distributorId: defaultDistributors[0].id,
    orderId: 'order_003',
    orderAmount: 1200,
    commissionRate: 0.1,
    commissionAmount: 120,
    level: 1,
    status: 'pending',
    description: '一级分销佣金',
    relatedUserId: 'user_002',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    settleAt: addDays(new Date(), 15).toISOString()
  }
];

if (!fs.existsSync(DISTRIBUTOR_FILE)) {
  fs.writeFileSync(DISTRIBUTOR_FILE, JSON.stringify(defaultDistributors, null, 2));
}

if (!fs.existsSync(DISTRIBUTION_RELATIONS_FILE)) {
  fs.writeFileSync(DISTRIBUTION_RELATIONS_FILE, JSON.stringify(defaultRelations, null, 2));
}

if (!fs.existsSync(DISTRIBUTION_COMMISSIONS_FILE)) {
  fs.writeFileSync(DISTRIBUTION_COMMISSIONS_FILE, JSON.stringify(defaultCommissions, null, 2));
}

if (!fs.existsSync(DISTRIBUTION_WITHDRAWALS_FILE)) {
  fs.writeFileSync(DISTRIBUTION_WITHDRAWALS_FILE, JSON.stringify([], null, 2));
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
        service: 'distribution-service',
        level,
        message,
        metadata
      })
    });
  } catch (error) {
    console.error('Log service unavailable:', error.message);
  }
};

const readData = (file, defaultData) => {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return defaultData;
  }
};

const writeData = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'REF';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

app.get('/api/distributors/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const distributors = readData(DISTRIBUTOR_FILE, defaultDistributors);
    const distributor = distributors.find(d => d.userId === userId);

    if (!distributor) {
      return res.status(404).json({ error: 'Distributor not found' });
    }

    const enriched = {
      ...distributor,
      formattedJoinTime: format(new Date(distributor.joinTime), 'yyyy-MM-dd HH:mm:ss'),
      commissionRate: distributor.level === 1 ? 0.1 : distributor.level === 2 ? 0.15 : 0.2
    };

    log('info', '获取分销商信息', { userId, level: distributor.level });
    res.json({ success: true, data: enriched });
  } catch (error) {
    log('error', '获取分销商信息失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/distributors/register', (req, res) => {
  try {
    const { userId, referralCode, userName, phone } = req.body;

    const distributors = readData(DISTRIBUTOR_FILE, defaultDistributors);
    const existing = distributors.find(d => d.userId === userId);

    if (existing) {
      return res.status(400).json({ error: 'Already a distributor' });
    }

    let referrerDistributor = null;
    if (referralCode) {
      referrerDistributor = distributors.find(d => d.referralCode === referralCode);
    }

    const newDistributor = {
      id: uuidv4(),
      userId,
      userName: userName || `用户${userId}`,
      phone: phone || '',
      level: 1,
      levelName: '初级分销商',
      status: 'active',
      joinTime: new Date().toISOString(),
      totalSales: 0,
      totalCommission: 0,
      withdrawableCommission: 0,
      withdrawnCommission: 0,
      teamCount: 0,
      firstLevelCount: 0,
      secondLevelCount: 0,
      referralCode: generateReferralCode(),
      qrCodeUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=QR%20code%20with%20gradient%20border%20premium%20design&image_size=square',
      shareUrl: `https://example.com/ref/${generateReferralCode()}`,
      referrerId: referrerDistributor ? referrerDistributor.id : null,
      referrerName: referrerDistributor ? referrerDistributor.userName : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    distributors.push(newDistributor);

    if (referrerDistributor) {
      const referrerIndex = distributors.findIndex(d => d.id === referrerDistributor.id);
      if (referrerIndex !== -1) {
        distributors[referrerIndex].firstLevelCount += 1;
        distributors[referrerIndex].teamCount += 1;
        distributors[referrerIndex].updatedAt = new Date().toISOString();

        const relations = readData(DISTRIBUTION_RELATIONS_FILE, defaultRelations);
        relations.push({
          id: uuidv4(),
          distributorId: referrerDistributor.id,
          userId,
          level: 1,
          parentDistributorId: null,
          status: 'active',
          bindTime: new Date().toISOString(),
          totalOrders: 0,
          totalAmount: 0,
          createdAt: new Date().toISOString()
        });
        writeData(DISTRIBUTION_RELATIONS_FILE, relations);
      }
    }

    writeData(DISTRIBUTOR_FILE, distributors);

    log('info', '分销商注册成功', { 
      userId, 
      referrerId: newDistributor.referrerId 
    });

    res.status(201).json({ 
      success: true, 
      data: newDistributor,
      message: 'Distributor registered successfully'
    });
  } catch (error) {
    log('error', '分销商注册失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/commissions/:distributorId', (req, res) => {
  try {
    const { distributorId } = req.params;
    const { status, limit = 20, offset = 0 } = req.query;

    let commissions = readData(DISTRIBUTION_COMMISSIONS_FILE, defaultCommissions)
      .filter(c => c.distributorId === distributorId)
      .map(c => ({
        ...c,
        formattedCreatedAt: format(new Date(c.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        formattedSettledAt: c.settledAt ? format(new Date(c.settledAt), 'yyyy-MM-dd HH:mm:ss') : null,
        formattedSettleAt: c.settleAt ? format(new Date(c.settleAt), 'yyyy-MM-dd HH:mm:ss') : null
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (status) {
      commissions = commissions.filter(c => c.status === status);
    }

    const total = commissions.length;
    const paginated = commissions.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    const statistics = {
      totalCommission: commissions.reduce((sum, c) => sum + c.commissionAmount, 0),
      settledCommission: commissions.filter(c => c.status === 'settled').reduce((sum, c) => sum + c.commissionAmount, 0),
      pendingCommission: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount, 0)
    };

    log('info', '获取佣金明细', { distributorId, count: paginated.length });
    res.json({
      success: true,
      data: paginated,
      statistics,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    log('error', '获取佣金明细失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/team/:distributorId', (req, res) => {
  try {
    const { distributorId } = req.params;
    const { level, limit = 20, offset = 0 } = req.query;

    let relations = readData(DISTRIBUTION_RELATIONS_FILE, defaultRelations)
      .filter(r => r.distributorId === distributorId)
      .map(r => ({
        ...r,
        formattedBindTime: format(new Date(r.bindTime), 'yyyy-MM-dd HH:mm:ss')
      }))
      .sort((a, b) => new Date(b.bindTime) - new Date(a.bindTime));

    if (level) {
      relations = relations.filter(r => r.level === parseInt(level));
    }

    const total = relations.length;
    const paginated = relations.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    const statistics = {
      totalMembers: relations.length,
      firstLevelCount: relations.filter(r => r.level === 1).length,
      secondLevelCount: relations.filter(r => r.level === 2).length,
      totalSales: relations.reduce((sum, r) => sum + r.totalAmount, 0),
      totalOrders: relations.reduce((sum, r) => sum + r.totalOrders, 0)
    };

    log('info', '获取团队成员', { distributorId, count: paginated.length });
    res.json({
      success: true,
      data: paginated,
      statistics,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    log('error', '获取团队成员失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/withdrawals/apply', (req, res) => {
  try {
    const { distributorId, amount, withdrawType = 'alipay', account, accountName } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (amount < 100) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is 100' });
    }

    const distributors = readData(DISTRIBUTOR_FILE, defaultDistributors);
    const distributorIndex = distributors.findIndex(d => d.id === distributorId);

    if (distributorIndex === -1) {
      return res.status(404).json({ error: 'Distributor not found' });
    }

    const distributor = distributors[distributorIndex];
    if (distributor.withdrawableCommission < amount) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        available: distributor.withdrawableCommission,
        requested: amount
      });
    }

    const withdrawal = {
      id: uuidv4(),
      withdrawalNo: `WD${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      distributorId,
      amount,
      withdrawType,
      account: account || '',
      accountName: accountName || '',
      status: 'pending',
      statusName: '处理中',
      applyTime: new Date().toISOString(),
      processTime: null,
      remark: null,
      createdAt: new Date().toISOString()
    };

    const withdrawals = readData(DISTRIBUTION_WITHDRAWALS_FILE, []);
    withdrawals.unshift(withdrawal);
    writeData(DISTRIBUTION_WITHDRAWALS_FILE, withdrawals);

    distributors[distributorIndex].withdrawableCommission -= amount;
    distributors[distributorIndex].updatedAt = new Date().toISOString();
    writeData(DISTRIBUTOR_FILE, distributors);

    log('info', '提现申请成功', { 
      distributorId, 
      amount,
      withdrawalNo: withdrawal.withdrawalNo
    });

    res.status(201).json({ 
      success: true, 
      data: withdrawal,
      message: 'Withdrawal applied successfully'
    });
  } catch (error) {
    log('error', '提现申请失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/withdrawals/:distributorId', (req, res) => {
  try {
    const { distributorId } = req.params;
    const { status, limit = 20, offset = 0 } = req.query;

    let withdrawals = readData(DISTRIBUTION_WITHDRAWALS_FILE, [])
      .filter(w => w.distributorId === distributorId)
      .map(w => ({
        ...w,
        formattedApplyTime: format(new Date(w.applyTime), 'yyyy-MM-dd HH:mm:ss'),
        formattedProcessTime: w.processTime ? format(new Date(w.processTime), 'yyyy-MM-dd HH:mm:ss') : null
      }))
      .sort((a, b) => new Date(b.applyTime) - new Date(a.applyTime));

    if (status) {
      withdrawals = withdrawals.filter(w => w.status === status);
    }

    const total = withdrawals.length;
    const paginated = withdrawals.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    log('info', '获取提现记录', { distributorId, count: paginated.length });
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
    log('error', '获取提现记录失败', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`分销服务运行在 http://localhost:${PORT}`);
});
