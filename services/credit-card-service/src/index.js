const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4005;
const LOGGER_SERVICE_URL = process.env.LOGGER_SERVICE_URL || 'http://localhost:4000';
const DATA_FILE = path.join(__dirname, '../../../data/credit-cards.json');

app.use(cors());
app.use(express.json());

const readData = (fp) => fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf8')) : null;
const writeData = (fp, d) => fs.writeFileSync(fp, JSON.stringify(d, null, 2), 'utf8');

const logToService = async (level, message, data = {}) => {
  try { await axios.post(`${LOGGER_SERVICE_URL}/log`, { level, message, service: 'credit-card-service', data, timestamp: new Date().toISOString() }); }
  catch (e) { console.error('Log error:', e.message); }
};

app.get('/health', (req, res) => {
  logToService('info', 'Health check called');
  res.json({ status: 'healthy', service: 'credit-card-service', timestamp: new Date().toISOString() });
});

app.get('/api/credit-cards', (req, res) => {
  const { customerId, cardType, status, page = 1, pageSize = 10 } = req.query;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  let cards = [...data.creditCards];
  if (customerId) cards = cards.filter(c => c.customerId === customerId);
  if (cardType) cards = cards.filter(c => c.cardType === cardType);
  if (status) cards = cards.filter(c => c.status === status);

  const total = cards.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const paginated = cards.slice(start, start + parseInt(pageSize));

  logToService('info', 'Credit cards query completed', { count: paginated.length, total });
  res.json({ success: true, data: { creditCards: paginated, pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total, totalPages: Math.ceil(total / parseInt(pageSize)) } } });
});

app.get('/api/credit-cards/:id', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  const card = data.creditCards.find(c => c.id === req.params.id);
  if (!card) return res.status(404).json({ error: 'Card not found' });
  logToService('info', 'Credit card detail retrieved', { id: req.params.id });
  res.json({ success: true, data: card });
});

app.get('/api/credit-cards/:id/transactions', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  const transactions = data.creditCardTransactions.filter(t => t.cardId === req.params.id);
  logToService('info', 'Credit card transactions retrieved', { cardId: req.params.id, count: transactions.length });
  res.json({ success: true, data: transactions });
});

app.post('/api/credit-cards', (req, res) => {
  const { customerId, cardType, creditLimit } = req.body;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  const cardTypes = {
    classic: { name: '普卡', rate: 0.20, defaultLimit: 10000 },
    gold: { name: '金卡', rate: 0.18, defaultLimit: 50000 },
    platinum: { name: '白金卡', rate: 0.15, defaultLimit: 150000 },
    black: { name: '黑卡', rate: 0.12, defaultLimit: 500000 }
  };
  const typeInfo = cardTypes[cardType];
  if (!typeInfo) return res.status(400).json({ error: 'Invalid card type' });

  const brands = ['VISA', 'MasterCard', 'AmericanExpress'];
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const cardNumber = brand === 'AmericanExpress' 
    ? '37' + Math.random().toString().slice(2, 15)
    : (brand === 'MasterCard' ? '55' : '41') + Math.random().toString().slice(2, 18);

  const card = {
    id: 'CC' + String(data.creditCards.length + 1).padStart(3, '0'),
    customerId, cardType, cardTypeName: typeInfo.name,
    brand, cardNumber: cardNumber.slice(0, 6) + '******' + cardNumber.slice(-4),
    creditLimit: creditLimit || typeInfo.defaultLimit,
    availableCredit: creditLimit || typeInfo.defaultLimit,
    currentBalance: 0, minPayment: 0, statementBalance: 0,
    status: 'active', issueDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    interestRate: typeInfo.rate,
    billingCycle: { cycleDay: 10, dueDay: 30 }
  };
  data.creditCards.push(card);
  writeData(DATA_FILE, data);

  logToService('info', 'Credit card created', { id: card.id, cardType, creditLimit: card.creditLimit });
  res.status(201).json({ success: true, data: card });
});

app.put('/api/credit-cards/:id/status', (req, res) => {
  const { status } = req.body;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  const index = data.creditCards.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Card not found' });
  data.creditCards[index].status = status;
  writeData(DATA_FILE, data);
  logToService('info', 'Credit card status updated', { id: req.params.id, status });
  res.json({ success: true, data: data.creditCards[index] });
});

app.listen(PORT, () => { console.log(`Credit card service running on port ${PORT}`); logToService('info', `Credit card service started on port ${PORT}`); });
