const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 58321; // 使用非标准端口

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readData(fileName) {
  const filePath = path.join(DATA_DIR, `${fileName}.json`);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

function writeData(fileName, data) {
  const filePath = path.join(DATA_DIR, `${fileName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

app.get('/api/customers', (req, res) => {
  const customers = readData('customers');
  res.json(customers);
});

app.get('/api/customers/:id', (req, res) => {
  const customers = readData('customers');
  const customer = customers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: '客户不存在' });
  }
  res.json(customer);
});

app.post('/api/customers', (req, res) => {
  const customers = readData('customers');
  const { v4: uuidv4 } = require('uuid');
  const newCustomer = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  customers.push(newCustomer);
  writeData('customers', customers);
  res.status(201).json(newCustomer);
});

app.put('/api/customers/:id', (req, res) => {
  const customers = readData('customers');
  const index = customers.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '客户不存在' });
  }
  customers[index] = { ...customers[index], ...req.body, updatedAt: new Date().toISOString() };
  writeData('customers', customers);
  res.json(customers[index]);
});

app.delete('/api/customers/:id', (req, res) => {
  const customers = readData('customers');
  const index = customers.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '客户不存在' });
  }
  customers.splice(index, 1);
  writeData('customers', customers);
  res.status(204).send();
});

app.get('/api/followups', (req, res) => {
  const followups = readData('followups');
  res.json(followups);
});

app.get('/api/followups/customer/:customerId', (req, res) => {
  const followups = readData('followups');
  const customerFollowups = followups.filter(f => f.customerId === req.params.customerId);
  res.json(customerFollowups);
});

app.post('/api/followups', (req, res) => {
  const followups = readData('followups');
  const { v4: uuidv4 } = require('uuid');
  const newFollowup = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  followups.push(newFollowup);
  writeData('followups', followups);
  res.status(201).json(newFollowup);
});

app.get('/api/opportunities', (req, res) => {
  const opportunities = readData('opportunities');
  res.json(opportunities);
});

app.get('/api/opportunities/:id', (req, res) => {
  const opportunities = readData('opportunities');
  const opportunity = opportunities.find(o => o.id === req.params.id);
  if (!opportunity) {
    return res.status(404).json({ error: '商机不存在' });
  }
  res.json(opportunity);
});

app.post('/api/opportunities', (req, res) => {
  const opportunities = readData('opportunities');
  const { v4: uuidv4 } = require('uuid');
  const newOpportunity = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  opportunities.push(newOpportunity);
  writeData('opportunities', opportunities);
  res.status(201).json(newOpportunity);
});

app.put('/api/opportunities/:id', (req, res) => {
  const opportunities = readData('opportunities');
  const index = opportunities.findIndex(o => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '商机不存在' });
  }
  opportunities[index] = { ...opportunities[index], ...req.body, updatedAt: new Date().toISOString() };
  writeData('opportunities', opportunities);
  res.json(opportunities[index]);
});

app.delete('/api/opportunities/:id', (req, res) => {
  const opportunities = readData('opportunities');
  const index = opportunities.findIndex(o => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '商机不存在' });
  }
  opportunities.splice(index, 1);
  writeData('opportunities', opportunities);
  res.status(204).send();
});

app.get('/api/renewal-alerts', (req, res) => {
  const alerts = readData('renewalAlerts');
  res.json(alerts);
});

app.post('/api/renewal-alerts', (req, res) => {
  const alerts = readData('renewalAlerts');
  const { v4: uuidv4 } = require('uuid');
  const newAlert = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  alerts.push(newAlert);
  writeData('renewalAlerts', alerts);
  res.status(201).json(newAlert);
});

app.put('/api/renewal-alerts/:id', (req, res) => {
  const alerts = readData('renewalAlerts');
  const index = alerts.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '预警不存在' });
  }
  alerts[index] = { ...alerts[index], ...req.body, updatedAt: new Date().toISOString() };
  writeData('renewalAlerts', alerts);
  res.json(alerts[index]);
});

app.get('/api/plans', (req, res) => {
  const plans = readData('plans');
  res.json(plans);
});

app.get('/api/plans/:id', (req, res) => {
  const plans = readData('plans');
  const plan = plans.find(p => p.id === req.params.id);
  if (!plan) {
    return res.status(404).json({ error: '方案不存在' });
  }
  res.json(plan);
});

app.post('/api/plans', (req, res) => {
  const plans = readData('plans');
  const { v4: uuidv4 } = require('uuid');
  const newPlan = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  plans.push(newPlan);
  writeData('plans', plans);
  res.status(201).json(newPlan);
});

app.put('/api/plans/:id', (req, res) => {
  const plans = readData('plans');
  const index = plans.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '方案不存在' });
  }
  plans[index] = { ...plans[index], ...req.body, updatedAt: new Date().toISOString() };
  writeData('plans', plans);
  res.json(plans[index]);
});

app.delete('/api/plans/:id', (req, res) => {
  const plans = readData('plans');
  const index = plans.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: '方案不存在' });
  }
  plans.splice(index, 1);
  writeData('plans', plans);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`B端客户分层运营系统后端服务已启动，端口: ${PORT}`);
  console.log(`API地址: http://localhost:${PORT}/api`);
});
