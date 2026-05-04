const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4001;
const LOGGER_SERVICE_URL = process.env.LOGGER_SERVICE_URL || 'http://localhost:4000';

const DATA_FILE = path.join(__dirname, '../../../data/accounts.json');
const CUSTOMERS_DATA_FILE = path.join(__dirname, '../../../data/customers.json');

app.use(cors());
app.use(express.json());

const readData = (filePath) => {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return null;
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const logToService = async (level, message, data = {}) => {
  try {
    await axios.post(`${LOGGER_SERVICE_URL}/log`, {
      level,
      message,
      service: 'account-service',
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Log service error:', error.message);
  }
};

app.get('/health', (req, res) => {
  logToService('info', 'Health check endpoint called');
  res.json({
    status: 'healthy',
    service: 'account-service',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/accounts', (req, res) => {
  const { customerId, accountType, status, page = 1, pageSize = 10 } = req.query;
  
  const data = readData(DATA_FILE);
  if (!data) {
    logToService('error', 'Accounts data file not found');
    return res.status(500).json({ error: 'Data file not found' });
  }

  let accounts = [...data.accounts];

  if (customerId) {
    accounts = accounts.filter(a => a.customerId === customerId);
  }

  if (accountType) {
    accounts = accounts.filter(a => a.accountType === accountType);
  }

  if (status) {
    accounts = accounts.filter(a => a.status === status);
  }

  const total = accounts.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const paginatedAccounts = accounts.slice(start, start + parseInt(pageSize));

  logToService('info', 'Accounts query completed', { 
    filters: { customerId, accountType, status },
    count: paginatedAccounts.length,
    total
  });

  res.json({
    success: true,
    data: {
      accounts: paginatedAccounts,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / parseInt(pageSize))
      }
    }
  });
});

app.get('/api/accounts/:id', (req, res) => {
  const { id } = req.params;
  
  const data = readData(DATA_FILE);
  if (!data) {
    logToService('error', 'Accounts data file not found');
    return res.status(500).json({ error: 'Data file not found' });
  }

  const account = data.accounts.find(a => a.id === id);
  
  if (!account) {
    logToService('warn', 'Account not found', { accountId: id });
    return res.status(404).json({ error: 'Account not found' });
  }

  logToService('info', 'Account details retrieved', { accountId: id });

  res.json({
    success: true,
    data: account
  });
});

app.get('/api/accounts/customer/:customerId', (req, res) => {
  const { customerId } = req.params;
  
  const data = readData(DATA_FILE);
  if (!data) {
    logToService('error', 'Accounts data file not found');
    return res.status(500).json({ error: 'Data file not found' });
  }

  const customerAccounts = data.accounts.filter(a => a.customerId === customerId);

  logToService('info', 'Customer accounts retrieved', { 
    customerId,
    count: customerAccounts.length
  });

  res.json({
    success: true,
    data: customerAccounts
  });
});

app.post('/api/accounts', (req, res) => {
  const { customerId, accountType, branch } = req.body;

  if (!customerId || !accountType) {
    logToService('warn', 'Invalid account creation request');
    return res.status(400).json({ error: 'customerId and accountType are required' });
  }

  const accountsData = readData(DATA_FILE);
  const customersData = readData(CUSTOMERS_DATA_FILE);
  
  if (!accountsData || !customersData) {
    logToService('error', 'Data files not found');
    return res.status(500).json({ error: 'Data files not found' });
  }

  const customer = customersData.customers.find(c => c.id === customerId);
  if (!customer) {
    logToService('warn', 'Customer not found for account creation', { customerId });
    return res.status(404).json({ error: 'Customer not found' });
  }

  const accountTypes = {
    savings: { name: '储蓄账户', interestRate: 0.025 },
    current: { name: '活期账户', interestRate: 0.003 },
    fixed: { name: '定期账户', interestRate: 0.035 }
  };

  const typeInfo = accountTypes[accountType];
  if (!typeInfo) {
    logToService('warn', 'Invalid account type', { accountType });
    return res.status(400).json({ error: 'Invalid account type' });
  }

  const accountNumber = '622202' + Math.random().toString().slice(2, 13) + Math.random().toString().slice(2, 5);

  const newAccount = {
    id: 'ACC' + String(accountsData.accounts.length + 1).padStart(3, '0'),
    customerId,
    accountNumber,
    accountType,
    accountTypeName: typeInfo.name,
    currency: 'CNY',
    balance: 0.00,
    availableBalance: 0.00,
    frozenAmount: 0.00,
    status: 'active',
    openDate: new Date().toISOString(),
    branch: branch || '默认网点',
    interestRate: typeInfo.interestRate
  };

  accountsData.accounts.push(newAccount);
  writeData(DATA_FILE, accountsData);

  logToService('info', 'New account created', { 
    accountId: newAccount.id,
    customerId,
    accountType
  });

  res.status(201).json({
    success: true,
    data: newAccount
  });
});

app.put('/api/accounts/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['active', 'frozen', 'closed'];
  if (!status || !validStatuses.includes(status)) {
    logToService('warn', 'Invalid status update request', { accountId: id, status });
    return res.status(400).json({ error: 'Invalid status' });
  }

  const data = readData(DATA_FILE);
  if (!data) {
    logToService('error', 'Accounts data file not found');
    return res.status(500).json({ error: 'Data file not found' });
  }

  const accountIndex = data.accounts.findIndex(a => a.id === id);
  
  if (accountIndex === -1) {
    logToService('warn', 'Account not found for status update', { accountId: id });
    return res.status(404).json({ error: 'Account not found' });
  }

  data.accounts[accountIndex].status = status;
  data.accounts[accountIndex].updateTime = new Date().toISOString();
  
  writeData(DATA_FILE, data);

  logToService('info', 'Account status updated', { 
    accountId: id,
    newStatus: status
  });

  res.json({
    success: true,
    data: data.accounts[accountIndex]
  });
});

app.put('/api/accounts/:id/freeze', (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (amount === undefined || amount < 0) {
    logToService('warn', 'Invalid freeze amount', { accountId: id, amount });
    return res.status(400).json({ error: 'Invalid freeze amount' });
  }

  const data = readData(DATA_FILE);
  if (!data) {
    logToService('error', 'Accounts data file not found');
    return res.status(500).json({ error: 'Data file not found' });
  }

  const accountIndex = data.accounts.findIndex(a => a.id === id);
  
  if (accountIndex === -1) {
    logToService('warn', 'Account not found for freeze', { accountId: id });
    return res.status(404).json({ error: 'Account not found' });
  }

  const account = data.accounts[accountIndex];
  
  if (account.availableBalance < amount) {
    logToService('warn', 'Insufficient balance for freeze', { 
      accountId: id,
      availableBalance: account.availableBalance,
      requestedAmount: amount
    });
    return res.status(400).json({ error: 'Insufficient available balance' });
  }

  account.frozenAmount = (account.frozenAmount || 0) + amount;
  account.availableBalance = account.balance - account.frozenAmount;
  account.updateTime = new Date().toISOString();
  
  writeData(DATA_FILE, data);

  logToService('info', 'Account amount frozen', { 
    accountId: id,
    frozenAmount: amount,
    totalFrozen: account.frozenAmount
  });

  res.json({
    success: true,
    data: account
  });
});

app.get('/api/accounts/stats/summary', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) {
    logToService('error', 'Accounts data file not found');
    return res.status(500).json({ error: 'Data file not found' });
  }

  const stats = {
    totalAccounts: data.accounts.length,
    totalBalance: data.accounts.reduce((sum, a) => sum + a.balance, 0),
    totalFrozen: data.accounts.reduce((sum, a) => sum + (a.frozenAmount || 0), 0),
    byType: {},
    byStatus: {}
  };

  data.accounts.forEach(account => {
    stats.byType[account.accountType] = (stats.byType[account.accountType] || 0) + 1;
    stats.byStatus[account.status] = (stats.byStatus[account.status] || 0) + 1;
  });

  logToService('info', 'Account statistics retrieved');

  res.json({
    success: true,
    data: stats
  });
});

app.listen(PORT, () => {
  console.log(`Account service running on port ${PORT}`);
  logToService('info', `Account service started on port ${PORT}`);
});
