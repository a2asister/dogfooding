const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4003;
const LOGGER_SERVICE_URL = process.env.LOGGER_SERVICE_URL || 'http://localhost:4000';
const DATA_FILE = path.join(__dirname, '../../../data/wealth-products.json');

app.use(cors());
app.use(express.json());

const readData = (fp) => fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf8')) : null;
const writeData = (fp, d) => fs.writeFileSync(fp, JSON.stringify(d, null, 2), 'utf8');

const logToService = async (level, message, data = {}) => {
  try { await axios.post(`${LOGGER_SERVICE_URL}/log`, { level, message, service: 'wealth-service', data, timestamp: new Date().toISOString() }); }
  catch (e) { console.error('Log error:', e.message); }
};

app.get('/health', (req, res) => {
  logToService('info', 'Health check called');
  res.json({ status: 'healthy', service: 'wealth-service', timestamp: new Date().toISOString() });
});

app.get('/api/wealth/products', (req, res) => {
  const { type, riskLevel, status, page = 1, pageSize = 10 } = req.query;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  let products = [...data.wealthProducts];
  if (type) products = products.filter(p => p.type === type);
  if (riskLevel) products = products.filter(p => p.riskLevel === riskLevel);
  if (status) products = products.filter(p => p.status === status);

  const total = products.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const paginated = products.slice(start, start + parseInt(pageSize));

  logToService('info', 'Products query completed', { count: paginated.length, total });
  res.json({ success: true, data: { products: paginated, pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total, totalPages: Math.ceil(total / parseInt(pageSize)) } } });
});

app.get('/api/wealth/products/:id', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  const product = data.wealthProducts.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  logToService('info', 'Product detail retrieved', { id: req.params.id });
  res.json({ success: true, data: product });
});

app.get('/api/wealth/investments', (req, res) => {
  const { customerId, status, page = 1, pageSize = 10 } = req.query;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  let investments = [...data.wealthInvestments];
  if (customerId) investments = investments.filter(i => i.customerId === customerId);
  if (status) investments = investments.filter(i => i.status === status);

  const total = investments.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const paginated = investments.slice(start, start + parseInt(pageSize));

  logToService('info', 'Investments query completed', { count: paginated.length, total });
  res.json({ success: true, data: { investments: paginated, pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total, totalPages: Math.ceil(total / parseInt(pageSize)) } } });
});

app.post('/api/wealth/invest', (req, res) => {
  const { customerId, productId, investAmount } = req.body;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  const product = data.wealthProducts.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (investAmount < product.minimumInvestment) return res.status(400).json({ error: `Minimum investment is ${product.minimumInvestment}` });

  const investment = {
    id: 'INV' + String(data.wealthInvestments.length + 1).padStart(3, '0'),
    customerId, productId, productName: product.name,
    investAmount, currentValue: investAmount,
    expectedReturn: product.expectedReturn,
    investDate: new Date().toISOString(),
    maturityDate: new Date(Date.now() + product.term * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active'
  };
  data.wealthInvestments.push(investment);
  writeData(DATA_FILE, data);

  logToService('info', 'Investment created', { id: investment.id, productId, investAmount });
  res.status(201).json({ success: true, data: investment });
});

app.listen(PORT, () => { console.log(`Wealth service running on port ${PORT}`); logToService('info', `Wealth service started on port ${PORT}`); });
