const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4008;
const LOGGER_SERVICE_URL = process.env.LOGGER_SERVICE_URL || 'http://localhost:4000';
const DATA_FILE = path.join(__dirname, '../../../data/customers.json');

app.use(cors());
app.use(express.json());

const readData = (fp) => fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf8')) : null;
const writeData = (fp, d) => fs.writeFileSync(fp, JSON.stringify(d, null, 2), 'utf8');

const logToService = async (level, message, data = {}) => {
  try { await axios.post(`${LOGGER_SERVICE_URL}/log`, { level, message, service: 'customer-service', data, timestamp: new Date().toISOString() }); }
  catch (e) { console.error('Log error:', e.message); }
};

app.get('/health', (req, res) => {
  logToService('info', 'Health check called');
  res.json({ status: 'healthy', service: 'customer-service', timestamp: new Date().toISOString() });
});

app.get('/api/customers', (req, res) => {
  const { name, phone, idCard, status, riskLevel, page = 1, pageSize = 10 } = req.query;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  let customers = [...data.customers];
  if (name) customers = customers.filter(c => c.name.includes(name));
  if (phone) customers = customers.filter(c => c.phone.includes(phone));
  if (idCard) customers = customers.filter(c => c.idCard.includes(idCard));
  if (status) customers = customers.filter(c => c.status === status);
  if (riskLevel) customers = customers.filter(c => c.riskLevel === riskLevel);

  const total = customers.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const paginated = customers.slice(start, start + parseInt(pageSize));

  logToService('info', 'Customers query completed', { count: paginated.length, total });
  res.json({ success: true, data: { customers: paginated, pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total, totalPages: Math.ceil(total / parseInt(pageSize)) } } });
});

app.get('/api/customers/:id', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  const customer = data.customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  logToService('info', 'Customer detail retrieved', { id: req.params.id });
  res.json({ success: true, data: customer });
});

app.post('/api/customers', (req, res) => {
  const { name, idCard, phone, email, address, occupation, income } = req.body;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  if (!name || !idCard || !phone) {
    logToService('warn', 'Invalid customer creation request');
    return res.status(400).json({ error: 'Name, idCard and phone are required' });
  }

  const existing = data.customers.find(c => c.idCard === idCard);
  if (existing) {
    logToService('warn', 'Customer with same idCard already exists', { idCard });
    return res.status(409).json({ error: 'Customer with this ID card already exists' });
  }

  const getRiskLevel = (income) => {
    if (income >= 50000) return { level: 'A', name: '低风险' };
    if (income >= 20000) return { level: 'B', name: '中低风险' };
    if (income >= 10000) return { level: 'C', name: '中风险' };
    return { level: 'D', name: '中高风险' };
  };

  const riskInfo = getRiskLevel(income || 10000);

  const customer = {
    id: 'CUST' + String(data.customers.length + 1).padStart(3, '0'),
    name, idCard, phone, email: email || '',
    address: address || '', occupation: occupation || '',
    income: income || 10000,
    riskLevel: riskInfo.level,
    status: 'active',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  };
  data.customers.push(customer);
  writeData(DATA_FILE, data);

  logToService('info', 'Customer created', { id: customer.id, name, idCard });
  res.status(201).json({ success: true, data: customer });
});

app.put('/api/customers/:id', (req, res) => {
  const { name, phone, email, address, occupation, income, status } = req.body;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  const index = data.customers.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Customer not found' });

  const customer = data.customers[index];
  if (name) customer.name = name;
  if (phone) customer.phone = phone;
  if (email !== undefined) customer.email = email;
  if (address !== undefined) customer.address = address;
  if (occupation !== undefined) customer.occupation = occupation;
  if (income !== undefined) {
    customer.income = income;
    const getRiskLevel = (inc) => {
      if (inc >= 50000) return { level: 'A', name: '低风险' };
      if (inc >= 20000) return { level: 'B', name: '中低风险' };
      if (inc >= 10000) return { level: 'C', name: '中风险' };
      return { level: 'D', name: '中高风险' };
    };
    customer.riskLevel = getRiskLevel(income).level;
  }
  if (status) customer.status = status;
  customer.updateTime = new Date().toISOString();

  writeData(DATA_FILE, data);
  logToService('info', 'Customer updated', { id: req.params.id });
  res.json({ success: true, data: customer });
});

app.put('/api/customers/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['active', 'inactive', 'frozen', 'closed'];
  if (!status || !validStatuses.includes(status)) {
    logToService('warn', 'Invalid status update request', { status });
    return res.status(400).json({ error: 'Invalid status' });
  }

  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  const index = data.customers.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Customer not found' });

  data.customers[index].status = status;
  data.customers[index].updateTime = new Date().toISOString();
  writeData(DATA_FILE, data);

  logToService('info', 'Customer status updated', { id: req.params.id, status });
  res.json({ success: true, data: data.customers[index] });
});

app.get('/api/customers/stats/summary', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });

  const stats = {
    totalCustomers: data.customers.length,
    byStatus: {},
    byRiskLevel: {},
    byOccupation: {}
  };

  data.customers.forEach(c => {
    stats.byStatus[c.status] = (stats.byStatus[c.status] || 0) + 1;
    stats.byRiskLevel[c.riskLevel] = (stats.byRiskLevel[c.riskLevel] || 0) + 1;
    if (c.occupation) {
      stats.byOccupation[c.occupation] = (stats.byOccupation[c.occupation] || 0) + 1;
    }
  });

  logToService('info', 'Customer stats retrieved');
  res.json({ success: true, data: stats });
});

app.get('/api/customer/dashboard', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });

  const personalCount = data.customers.filter(c => !c.type || c.type === 'personal').length;
  const enterpriseCount = data.customers.filter(c => c.type === 'enterprise').length;
  const vipCount = data.customers.filter(c => c.type === 'vip').length;
  const activeCount = data.customers.filter(c => c.status === 'active').length;

  const dashboard = {
    totalCustomers: data.customers.length,
    vipCustomers: vipCount,
    enterpriseCustomers: enterpriseCount,
    personalCustomers: personalCount,
    activeCustomers: activeCount
  };

  logToService('info', 'Customer dashboard retrieved');
  res.json({ success: true, data: dashboard });
});

app.get('/api/customer/list', (req, res) => {
  const { name, phone, idCard, status, riskLevel, page = 1, pageSize = 10 } = req.query;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  let customers = [...data.customers];
  if (name) customers = customers.filter(c => c.name && c.name.includes(name));
  if (phone) customers = customers.filter(c => c.phone && c.phone.includes(phone));
  if (idCard) customers = customers.filter(c => c.idCard && c.idCard.includes(idCard));
  if (status) customers = customers.filter(c => c.status === status);
  if (riskLevel) customers = customers.filter(c => c.riskLevel === riskLevel);

  const total = customers.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const paginated = customers.slice(start, start + parseInt(pageSize));

  logToService('info', 'Customers list query completed', { count: paginated.length, total });
  res.json({ success: true, data: { customers: paginated, pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total, totalPages: Math.ceil(total / parseInt(pageSize)) } } });
});

app.get('/api/customer/stats', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });

  const personalCount = data.customers.filter(c => !c.type || c.type === 'personal').length;
  const enterpriseCount = data.customers.filter(c => c.type === 'enterprise').length;
  const vipCount = data.customers.filter(c => c.type === 'vip').length;
  const activeCount = data.customers.filter(c => c.status === 'active').length;

  const stats = {
    totalCustomers: data.customers.length,
    vipCustomers: vipCount,
    enterpriseCustomers: enterpriseCount,
    personalCustomers: personalCount,
    activeCustomers: activeCount
  };

  logToService('info', 'Customer stats retrieved');
  res.json({ success: true, data: stats });
});

app.get('/api/customer/:id', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  const customer = data.customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  logToService('info', 'Customer detail retrieved', { id: req.params.id });
  res.json({ success: true, data: customer });
});

app.post('/api/customer', (req, res) => {
  const { name, idCard, phone, email, address, occupation, income } = req.body;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  if (!name || !idCard || !phone) {
    logToService('warn', 'Invalid customer creation request');
    return res.status(400).json({ error: 'Name, idCard and phone are required' });
  }

  const existing = data.customers.find(c => c.idCard === idCard);
  if (existing) {
    logToService('warn', 'Customer with same idCard already exists', { idCard });
    return res.status(409).json({ error: 'Customer with this ID card already exists' });
  }

  const getRiskLevel = (income) => {
    if (income >= 50000) return { level: 'A', name: '低风险' };
    if (income >= 20000) return { level: 'B', name: '中低风险' };
    if (income >= 10000) return { level: 'C', name: '中风险' };
    return { level: 'D', name: '中高风险' };
  };

  const riskInfo = getRiskLevel(income || 10000);

  const customer = {
    id: 'CUST' + String(data.customers.length + 1).padStart(3, '0'),
    name, idCard, phone, email: email || '',
    address: address || '', occupation: occupation || '',
    income: income || 10000,
    riskLevel: riskInfo.level,
    status: 'active',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  };
  data.customers.push(customer);
  writeData(DATA_FILE, data);

  logToService('info', 'Customer created', { id: customer.id, name, idCard });
  res.status(201).json({ success: true, data: customer });
});

app.put('/api/customer/:id', (req, res) => {
  const { name, phone, email, address, occupation, income, status } = req.body;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  const index = data.customers.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Customer not found' });

  const customer = data.customers[index];
  if (name) customer.name = name;
  if (phone) customer.phone = phone;
  if (email !== undefined) customer.email = email;
  if (address !== undefined) customer.address = address;
  if (occupation !== undefined) customer.occupation = occupation;
  if (income !== undefined) {
    customer.income = income;
    const getRiskLevel = (inc) => {
      if (inc >= 50000) return { level: 'A', name: '低风险' };
      if (inc >= 20000) return { level: 'B', name: '中低风险' };
      if (inc >= 10000) return { level: 'C', name: '中风险' };
      return { level: 'D', name: '中高风险' };
    };
    customer.riskLevel = getRiskLevel(income).level;
  }
  if (status) customer.status = status;
  customer.updateTime = new Date().toISOString();

  writeData(DATA_FILE, data);
  logToService('info', 'Customer updated', { id: req.params.id });
  res.json({ success: true, data: customer });
});

app.listen(PORT, () => { console.log(`Customer service running on port ${PORT}`); logToService('info', `Customer service started on port ${PORT}`); });
