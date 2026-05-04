const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4004;
const LOGGER_SERVICE_URL = process.env.LOGGER_SERVICE_URL || 'http://localhost:4000';
const DATA_FILE = path.join(__dirname, '../../../data/loans.json');

app.use(cors());
app.use(express.json());

const readData = (fp) => fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf8')) : null;
const writeData = (fp, d) => fs.writeFileSync(fp, JSON.stringify(d, null, 2), 'utf8');

const logToService = async (level, message, data = {}) => {
  try { await axios.post(`${LOGGER_SERVICE_URL}/log`, { level, message, service: 'loan-service', data, timestamp: new Date().toISOString() }); }
  catch (e) { console.error('Log error:', e.message); }
};

app.get('/health', (req, res) => {
  logToService('info', 'Health check called');
  res.json({ status: 'healthy', service: 'loan-service', timestamp: new Date().toISOString() });
});

app.get('/api/loans', (req, res) => {
  const { customerId, loanType, status, approvalStatus, page = 1, pageSize = 10 } = req.query;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  let loans = [...data.loans];
  if (customerId) loans = loans.filter(l => l.customerId === customerId);
  if (loanType) loans = loans.filter(l => l.loanType === loanType);
  if (status) loans = loans.filter(l => l.status === status);
  if (approvalStatus) loans = loans.filter(l => l.approvalStatus === approvalStatus);

  const total = loans.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const paginated = loans.slice(start, start + parseInt(pageSize));

  logToService('info', 'Loans query completed', { count: paginated.length, total });
  res.json({ success: true, data: { loans: paginated, pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total, totalPages: Math.ceil(total / parseInt(pageSize)) } } });
});

app.get('/api/loans/:id', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  const loan = data.loans.find(l => l.id === req.params.id);
  if (!loan) return res.status(404).json({ error: 'Loan not found' });
  logToService('info', 'Loan detail retrieved', { id: req.params.id });
  res.json({ success: true, data: loan });
});

app.get('/api/loans/:id/payments', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  const payments = data.loanPayments.filter(p => p.loanId === req.params.id);
  logToService('info', 'Loan payments retrieved', { loanId: req.params.id, count: payments.length });
  res.json({ success: true, data: payments });
});

app.post('/api/loans', (req, res) => {
  const { customerId, loanType, loanAmount, term, purpose, collateral } = req.body;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  const loanTypes = {
    personal: { name: '个人消费贷', rate: 0.065 },
    mortgage: { name: '房屋抵押贷款', rate: 0.042 },
    business: { name: '企业经营贷', rate: 0.058 },
    auto: { name: '汽车贷款', rate: 0.055 }
  };
  const typeInfo = loanTypes[loanType];
  if (!typeInfo) return res.status(400).json({ error: 'Invalid loan type' });

  const monthlyRate = typeInfo.rate / 12;
  const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);

  const loan = {
    id: 'LOAN' + String(data.loans.length + 1).padStart(3, '0'),
    customerId, loanType, loanTypeName: typeInfo.name,
    loanAmount, approvedAmount: loanAmount,
    disbursedAmount: 0, outstandingBalance: loanAmount,
    interestRate: typeInfo.rate, term, termUnit: 'month',
    monthlyPayment, status: 'active', approvalStatus: 'pending',
    applyDate: new Date().toISOString(),
    approvalDate: null, disbursementDate: null,
    maturityDate: new Date(Date.now() + term * 30 * 24 * 60 * 60 * 1000).toISOString(),
    purpose, collateral: collateral || null
  };
  data.loans.push(loan);
  writeData(DATA_FILE, data);

  logToService('info', 'Loan application created', { id: loan.id, loanType, loanAmount });
  res.status(201).json({ success: true, data: loan });
});

app.put('/api/loans/:id/approve', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  const index = data.loans.findIndex(l => l.id === req.params.id);
  if (!index) return res.status(404).json({ error: 'Loan not found' });
  data.loans[index].approvalStatus = 'approved';
  data.loans[index].approvalDate = new Date().toISOString();
  writeData(DATA_FILE, data);
  logToService('info', 'Loan approved', { id: req.params.id });
  res.json({ success: true, data: data.loans[index] });
});

app.listen(PORT, () => { console.log(`Loan service running on port ${PORT}`); logToService('info', `Loan service started on port ${PORT}`); });
