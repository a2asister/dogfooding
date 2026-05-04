const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4007;
const LOGGER_SERVICE_URL = process.env.LOGGER_SERVICE_URL || 'http://localhost:4000';
const DATA_FILE = path.join(__dirname, '../../../data/reports.json');

app.use(cors());
app.use(express.json());

const readData = (fp) => fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf8')) : null;
const writeData = (fp, d) => fs.writeFileSync(fp, JSON.stringify(d, null, 2), 'utf8');

const logToService = async (level, message, data = {}) => {
  try { await axios.post(`${LOGGER_SERVICE_URL}/log`, { level, message, service: 'report-service', data, timestamp: new Date().toISOString() }); }
  catch (e) { console.error('Log error:', e.message); }
};

app.get('/health', (req, res) => {
  logToService('info', 'Health check called');
  res.json({ status: 'healthy', service: 'report-service', timestamp: new Date().toISOString() });
});

app.get('/api/report/dashboard', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });

  const todayAmount = Math.floor(Math.random() * 5000000) + 2000000;
  const todayCount = Math.floor(Math.random() * 500) + 800;
  const loanBalance = Math.floor(Math.random() * 20000000) + 10000000;
  const activeCustomers = Math.floor(Math.random() * 2000) + 3000;

  const dashboard = {
    todayAmount,
    todayCount,
    loanBalance,
    activeCustomers,
    totalAccounts: 1526,
    creditCards: 1053,
    wealthProducts: 38,
    activeLoans: 245
  };

  logToService('info', 'Report dashboard retrieved');
  res.json({ success: true, data: dashboard });
});

app.get('/api/reports/daily', (req, res) => {
  const { startDate, endDate, page = 1, pageSize = 10 } = req.query;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  let reports = [...data.dailyReports];
  if (startDate) reports = reports.filter(r => new Date(r.reportDate) >= new Date(startDate));
  if (endDate) reports = reports.filter(r => new Date(r.reportDate) <= new Date(endDate));

  reports.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));

  const total = reports.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const paginated = reports.slice(start, start + parseInt(pageSize));

  logToService('info', 'Daily reports query completed', { count: paginated.length, total });
  res.json({ success: true, data: { reports: paginated, pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total, totalPages: Math.ceil(total / parseInt(pageSize)) } } });
});

app.get('/api/report/daily', (req, res) => {
  const { date } = req.query;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });

  const report = {
    totalAmount: 2895600,
    transactionCount: 1256,
    newAccounts: 38,
    loanDisbursed: 850000,
    depositAmount: 586000,
    withdrawAmount: 425000,
    transferAmount: 1884600,
    wealthPurchase: 320000,
    transactionTypes: {
      '存款': { count: 356, amount: 586000 },
      '取款': { count: 289, amount: 425000 },
      '转账': { count: 412, amount: 1884600 },
      '理财购买': { count: 89, amount: 320000 },
      '贷款还款': { count: 110, amount: 267000 }
    }
  };

  logToService('info', 'Daily report retrieved', { date });
  res.json({ success: true, data: report });
});

app.get('/api/reports/daily/:id', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  const report = data.dailyReports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  logToService('info', 'Daily report detail retrieved', { id: req.params.id });
  res.json({ success: true, data: report });
});

app.get('/api/reports/monthly', (req, res) => {
  const { year, month, page = 1, pageSize = 10 } = req.query;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  let reports = [...data.monthlyReports];
  if (year) reports = reports.filter(r => r.reportMonth.startsWith(year));
  if (month) reports = reports.filter(r => r.reportMonth.endsWith(`-${month.padStart(2, '0')}`));

  reports.sort((a, b) => new Date(b.reportMonth + '-01') - new Date(a.reportMonth + '-01'));

  const total = reports.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const paginated = reports.slice(start, start + parseInt(pageSize));

  logToService('info', 'Monthly reports query completed', { count: paginated.length, total });
  res.json({ success: true, data: { reports: paginated, pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total, totalPages: Math.ceil(total / parseInt(pageSize)) } } });
});

app.get('/api/report/monthly', (req, res) => {
  const { year, month } = req.query;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });

  const report = {
    totalAmount: 44560000,
    transactionCount: 12856,
    newAccounts: 456,
    loanBalance: 12850000,
    newCustomers: 128,
    activeCustomers: 895,
    inactiveCustomers: 156,
    highValueCustomers: 45,
    creditCardCustomers: 523,
    depositTotal: 15680000,
    depositCount: 3856,
    withdrawTotal: 11250000,
    withdrawCount: 2896,
    transferTotal: 22560000,
    transferCount: 4125,
    wealthTotal: 8560000,
    wealthCount: 896,
    loanTotal: 6850000,
    loanCount: 245
  };

  logToService('info', 'Monthly report retrieved', { year, month });
  res.json({ success: true, data: report });
});

app.get('/api/reports/custom', (req, res) => {
  const { type, status, page = 1, pageSize = 10 } = req.query;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  let reports = [...data.customReports];
  if (type) reports = reports.filter(r => r.type === type);
  if (status) reports = reports.filter(r => r.status === status);

  const total = reports.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const paginated = reports.slice(start, start + parseInt(pageSize));

  logToService('info', 'Custom reports query completed', { count: paginated.length, total });
  res.json({ success: true, data: { reports: paginated, pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total, totalPages: Math.ceil(total / parseInt(pageSize)) } } });
});

app.get('/api/report/custom', (req, res) => {
  const { startDate, endDate, businessType, customerType } = req.query;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });

  const report = {
    totalAmount: 28956000,
    transactionCount: 12856,
    customerCount: 3892,
    avgAmount: 2252,
    records: [
      { id: 'TXN001', date: '2025-01-15', businessType: '转账', customerId: 'C001', amount: 50000, status: 'success' },
      { id: 'TXN002', date: '2025-01-15', businessType: '存款', customerId: 'C002', amount: 20000, status: 'success' },
      { id: 'TXN003', date: '2025-01-14', businessType: '理财购买', customerId: 'C003', amount: 100000, status: 'success' },
      { id: 'TXN004', date: '2025-01-14', businessType: '贷款发放', customerId: 'C004', amount: 200000, status: 'success' },
      { id: 'TXN005', date: '2025-01-13', businessType: '取款', customerId: 'C005', amount: 15000, status: 'success' }
    ]
  };

  logToService('info', 'Custom report retrieved', { startDate, endDate, businessType, customerType });
  res.json({ success: true, data: report });
});

app.post('/api/reports/custom', (req, res) => {
  const { name, type, description, filters } = req.body;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  const report = {
    id: 'CR' + String(data.customReports.length + 1).padStart(3, '0'),
    name, type: type || 'custom', description,
    filters: filters || {},
    createTime: new Date().toISOString(),
    lastRunTime: null, status: 'ready'
  };
  data.customReports.push(report);
  writeData(DATA_FILE, data);

  logToService('info', 'Custom report created', { id: report.id, name, type });
  res.status(201).json({ success: true, data: report });
});

app.post('/api/reports/generate/:type', (req, res) => {
  const { type } = req.params;
  const { reportDate, filters } = req.body;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });

  const reportTypes = {
    daily: {
      id: 'DR' + Date.now(),
      reportDate: reportDate || new Date().toISOString().slice(0, 10),
      summary: {
        totalTransactions: Math.floor(Math.random() * 1000) + 500,
        totalTransactionAmount: Math.floor(Math.random() * 10000000) + 1000000,
        newCustomers: Math.floor(Math.random() * 50) + 10,
        newAccounts: Math.floor(Math.random() * 30) + 5,
        totalLoans: Math.floor(Math.random() * 10) + 1,
        totalLoanAmount: Math.floor(Math.random() * 5000000) + 500000
      },
      transactionBreakdown: {
        transfer: { count: Math.floor(Math.random() * 500) + 100, amount: Math.floor(Math.random() * 5000000) + 500000 },
        deposit: { count: Math.floor(Math.random() * 200) + 50, amount: Math.floor(Math.random() * 2000000) + 200000 },
        withdraw: { count: Math.floor(Math.random() * 150) + 30, amount: Math.floor(Math.random() * 1000000) + 100000 },
        payment: { count: Math.floor(Math.random() * 200) + 50, amount: Math.floor(Math.random() * 1500000) + 150000 }
      },
      riskMetrics: {
        riskAlerts: Math.floor(Math.random() * 10),
        fraudAttempts: Math.floor(Math.random() * 3),
        transactionDeclines: Math.floor(Math.random() * 20)
      },
      generateTime: new Date().toISOString()
    }
  };

  const report = reportTypes[type];
  if (!report) return res.status(400).json({ error: 'Invalid report type' });

  if (type === 'daily') {
    data.dailyReports.push(report);
    writeData(DATA_FILE, data);
  }

  logToService('info', 'Report generated', { type, id: report.id });
  res.status(201).json({ success: true, data: report });
});

app.listen(PORT, () => { console.log(`Report service running on port ${PORT}`); logToService('info', `Report service started on port ${PORT}`); });
