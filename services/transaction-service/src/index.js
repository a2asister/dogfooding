const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4002;
const LOGGER_SERVICE_URL = process.env.LOGGER_SERVICE_URL || 'http://localhost:4000';

const DATA_FILE = path.join(__dirname, '../../../data/transactions.json');
const ACCOUNTS_DATA_FILE = path.join(__dirname, '../../../data/accounts.json');

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
      level, message, service: 'transaction-service', data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Log service error:', error.message);
  }
};

app.get('/health', (req, res) => {
  logToService('info', 'Health check called');
  res.json({ status: 'healthy', service: 'transaction-service', timestamp: new Date().toISOString() });
});

app.get('/api/transactions', (req, res) => {
  const { fromAccount, toAccount, transactionType, status, startDate, endDate, page = 1, pageSize = 10 } = req.query;
  
  const data = readData(DATA_FILE);
  if (!data) {
    logToService('error', 'Transactions data file not found');
    return res.status(500).json({ error: 'Data file not found' });
  }

  let transactions = [...data.transactions];

  if (fromAccount) {
    transactions = transactions.filter(t => t.fromAccountNumber === fromAccount || t.fromAccountId === fromAccount);
  }
  if (toAccount) {
    transactions = transactions.filter(t => t.toAccountNumber === toAccount || t.toAccountId === toAccount);
  }
  if (transactionType) {
    transactions = transactions.filter(t => t.transactionType === transactionType);
  }
  if (status) {
    transactions = transactions.filter(t => t.status === status);
  }
  if (startDate) {
    transactions = transactions.filter(t => new Date(t.createTime) >= new Date(startDate));
  }
  if (endDate) {
    transactions = transactions.filter(t => new Date(t.createTime) <= new Date(endDate));
  }

  transactions.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

  const total = transactions.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const paginated = transactions.slice(start, start + parseInt(pageSize));

  logToService('info', 'Transactions query completed', { count: paginated.length, total });

  res.json({
    success: true,
    data: {
      transactions: paginated,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / parseInt(pageSize))
      }
    }
  });
});

app.get('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });

  const transaction = data.transactions.find(t => t.id === id);
  if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

  logToService('info', 'Transaction detail retrieved', { id });
  res.json({ success: true, data: transaction });
});

app.post('/api/transactions', (req, res) => {
  const { transactionType, fromAccountId, toAccountId, amount, description, channel } = req.body;

  if (!transactionType || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid transaction parameters' });
  }

  const transactionsData = readData(DATA_FILE);
  const accountsData = readData(ACCOUNTS_DATA_FILE);

  if (!transactionsData || !accountsData) {
    return res.status(500).json({ error: 'Data files not found' });
  }

  let fromAccount, toAccount;
  if (fromAccountId) {
    fromAccount = accountsData.accounts.find(a => a.id === fromAccountId);
  }
  if (toAccountId) {
    toAccount = accountsData.accounts.find(a => a.id === toAccountId);
  }

  const transactionTypes = {
    transfer: { name: '转账', requiresFrom: true, requiresTo: true },
    deposit: { name: '存款', requiresFrom: false, requiresTo: true },
    withdraw: { name: '取款', requiresFrom: true, requiresTo: false },
    payment: { name: '支付', requiresFrom: true, requiresTo: true }
  };

  const typeInfo = transactionTypes[transactionType];
  if (!typeInfo) {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }

  if (typeInfo.requiresFrom && !fromAccount) {
    return res.status(400).json({ error: 'Source account not found' });
  }
  if (typeInfo.requiresTo && !toAccount) {
    return res.status(400).json({ error: 'Target account not found' });
  }

  if (typeInfo.requiresFrom && fromAccount.availableBalance < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  const newTransaction = {
    id: 'TXN' + String(transactionsData.transactions.length + 1).padStart(3, '0'),
    transactionType,
    transactionTypeName: typeInfo.name,
    fromAccountId: fromAccount?.id,
    fromAccountNumber: fromAccount?.accountNumber,
    toAccountId: toAccount?.id,
    toAccountNumber: toAccount?.accountNumber,
    amount: parseFloat(amount),
    currency: 'CNY',
    status: 'success',
    createTime: new Date().toISOString(),
    completeTime: new Date().toISOString(),
    description: description || '',
    channel: channel || 'web',
    fee: 0.00
  };

  if (fromAccount && typeInfo.requiresFrom) {
    const fromIndex = accountsData.accounts.findIndex(a => a.id === fromAccount.id);
    accountsData.accounts[fromIndex].balance -= amount;
    accountsData.accounts[fromIndex].availableBalance -= amount;
  }
  if (toAccount && typeInfo.requiresTo) {
    const toIndex = accountsData.accounts.findIndex(a => a.id === toAccount.id);
    accountsData.accounts[toIndex].balance += amount;
    accountsData.accounts[toIndex].availableBalance += amount;
  }

  transactionsData.transactions.push(newTransaction);
  writeData(DATA_FILE, transactionsData);
  if (fromAccount || toAccount) {
    writeData(ACCOUNTS_DATA_FILE, accountsData);
  }

  logToService('info', 'Transaction created', { 
    id: newTransaction.id,
    type: transactionType,
    amount
  });

  res.status(201).json({ success: true, data: newTransaction });
});

app.get('/api/transactions/stats/summary', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });

  const stats = {
    totalTransactions: data.transactions.length,
    totalAmount: data.transactions.reduce((sum, t) => sum + t.amount, 0),
    byType: {},
    byStatus: {},
    byChannel: {}
  };

  data.transactions.forEach(t => {
    stats.byType[t.transactionType] = (stats.byType[t.transactionType] || 0) + 1;
    stats.byStatus[t.status] = (stats.byStatus[t.status] || 0) + 1;
    if (t.channel) {
      stats.byChannel[t.channel] = (stats.byChannel[t.channel] || 0) + 1;
    }
  });

  logToService('info', 'Transaction stats retrieved');
  res.json({ success: true, data: stats });
});

app.listen(PORT, () => {
  console.log(`Transaction service running on port ${PORT}`);
  logToService('info', `Transaction service started on port ${PORT}`);
});
