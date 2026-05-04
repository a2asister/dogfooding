const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4006;
const LOGGER_SERVICE_URL = process.env.LOGGER_SERVICE_URL || 'http://localhost:4000';
const DATA_FILE = path.join(__dirname, '../../../data/risk-control.json');

app.use(cors());
app.use(express.json());

const readData = (fp) => fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf8')) : null;
const writeData = (fp, d) => fs.writeFileSync(fp, JSON.stringify(d, null, 2), 'utf8');

const logToService = async (level, message, data = {}) => {
  try { await axios.post(`${LOGGER_SERVICE_URL}/log`, { level, message, service: 'risk-service', data, timestamp: new Date().toISOString() }); }
  catch (e) { console.error('Log error:', e.message); }
};

app.get('/health', (req, res) => {
  logToService('info', 'Health check called');
  res.json({ status: 'healthy', service: 'risk-service', timestamp: new Date().toISOString() });
});

app.get('/api/risk/assessments', (req, res) => {
  const { customerId, assessmentType, status, page = 1, pageSize = 10 } = req.query;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  let assessments = [...data.riskAssessments];
  if (customerId) assessments = assessments.filter(a => a.customerId === customerId);
  if (assessmentType) assessments = assessments.filter(a => a.assessmentType === assessmentType);
  if (status) assessments = assessments.filter(a => a.status === status);

  const total = assessments.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const paginated = assessments.slice(start, start + parseInt(pageSize));

  logToService('info', 'Risk assessments query completed', { count: paginated.length, total });
  res.json({ success: true, data: { assessments: paginated, pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total, totalPages: Math.ceil(total / parseInt(pageSize)) } } });
});

app.get('/api/risk/assessments/:id', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  const assessment = data.riskAssessments.find(a => a.id === req.params.id);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
  logToService('info', 'Risk assessment detail retrieved', { id: req.params.id });
  res.json({ success: true, data: assessment });
});

app.post('/api/risk/assessments', (req, res) => {
  const { customerId, assessmentType } = req.body;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  const factors = { paymentHistory: Math.floor(Math.random() * 30) + 70, creditUtilization: Math.floor(Math.random() * 50) + 10, creditHistory: Math.floor(Math.random() * 10) + 1, creditMix: Math.floor(Math.random() * 5) + 1, newCredit: Math.floor(Math.random() * 3) };
  const riskScore = Math.floor((factors.paymentHistory * 0.35) + (100 - factors.creditUtilization) * 0.3 + (factors.creditHistory * 5) * 0.15 + (factors.creditMix * 10) * 0.1 + (100 - factors.newCredit * 10) * 0.1);
  
  const riskLevels = [{ score: 800, level: 'A', name: '低风险' }, { score: 700, level: 'B', name: '中低风险' }, { score: 600, level: 'C', name: '中风险' }, { score: 500, level: 'D', name: '中高风险' }];
  const riskInfo = riskLevels.find(r => riskScore >= r.score) || { level: 'E', name: '高风险' };

  const assessment = {
    id: 'RA' + String(data.riskAssessments.length + 1).padStart(3, '0'),
    customerId, assessmentType: assessmentType || 'credit',
    riskScore, riskLevel: riskInfo.level, riskLevelName: riskInfo.name,
    creditLimit: riskScore >= 700 ? 500000 : riskScore >= 600 ? 200000 : 100000,
    assessmentDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active', factors
  };
  data.riskAssessments.push(assessment);
  writeData(DATA_FILE, data);

  logToService('info', 'Risk assessment created', { id: assessment.id, customerId, riskScore });
  res.status(201).json({ success: true, data: assessment });
});

app.get('/api/risk/alerts', (req, res) => {
  const { customerId, severity, status, page = 1, pageSize = 10 } = req.query;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  let alerts = [...data.riskAlerts];
  if (customerId) alerts = alerts.filter(a => a.customerId === customerId);
  if (severity) alerts = alerts.filter(a => a.severity === severity);
  if (status) alerts = alerts.filter(a => a.status === status);

  const total = alerts.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const paginated = alerts.slice(start, start + parseInt(pageSize));

  logToService('info', 'Risk alerts query completed', { count: paginated.length, total });
  res.json({ success: true, data: { alerts: paginated, pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total, totalPages: Math.ceil(total / parseInt(pageSize)) } } });
});

app.put('/api/risk/alerts/:id/resolve', (req, res) => {
  const { resolution } = req.body;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  const index = data.riskAlerts.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Alert not found' });
  data.riskAlerts[index].status = 'resolved';
  data.riskAlerts[index].resolution = resolution || '已处理';
  writeData(DATA_FILE, data);
  logToService('info', 'Risk alert resolved', { id: req.params.id });
  res.json({ success: true, data: data.riskAlerts[index] });
});

app.get('/api/risk/blacklist', (req, res) => {
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  logToService('info', 'Blacklist query completed', { count: data.blacklist.length });
  res.json({ success: true, data: data.blacklist });
});

app.post('/api/risk/blacklist', (req, res) => {
  const { type, idCard, name, reason } = req.body;
  const data = readData(DATA_FILE);
  if (!data) return res.status(500).json({ error: 'Data file not found' });
  
  const item = {
    id: 'BL' + String(data.blacklist.length + 1).padStart(3, '0'),
    type: type || 'customer', idCard, name, reason,
    blacklistTime: new Date().toISOString(),
    expiryTime: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active'
  };
  data.blacklist.push(item);
  writeData(DATA_FILE, data);

  logToService('info', 'Blacklist item added', { id: item.id, idCard, name });
  res.status(201).json({ success: true, data: item });
});

app.listen(PORT, () => { console.log(`Risk service running on port ${PORT}`); logToService('info', `Risk service started on port ${PORT}`); });
