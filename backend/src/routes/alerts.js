const Router = require('koa-router');
const { v4: uuidv4 } = require('uuid');
const { logsStore, alertsStore, alertRulesStore } = require('../utils/store');

const router = new Router();

const ALERT_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const ALERT_STATUS = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'CLOSED'];

function evaluateRule(rule, logs) {
  const { 
    condition, 
    level, 
    service, 
    keyword, 
    threshold,
    timeWindow = 60000
  } = rule;
  
  const now = Date.now();
  const windowStart = now - timeWindow;
  
  let filteredLogs = logs.filter(log => log.timestamp >= windowStart);
  
  if (level) {
    filteredLogs = filteredLogs.filter(log => log.level === level);
  }
  
  if (service) {
    filteredLogs = filteredLogs.filter(log => log.service === service);
  }
  
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filteredLogs = filteredLogs.filter(log => 
      log.message.toLowerCase().includes(lowerKeyword)
    );
  }
  
  let triggered = false;
  let currentValue = filteredLogs.length;
  
  switch (condition) {
    case 'count_gt':
      triggered = filteredLogs.length > threshold;
      break;
    case 'count_gte':
      triggered = filteredLogs.length >= threshold;
      break;
    case 'count_lt':
      triggered = filteredLogs.length < threshold;
      break;
    case 'count_lte':
      triggered = filteredLogs.length <= threshold;
      break;
    case 'error_rate_gt':
      const totalLogs = logs.filter(log => log.timestamp >= windowStart).length;
      const errorLogs = filteredLogs.length;
      currentValue = totalLogs > 0 ? (errorLogs / totalLogs) * 100 : 0;
      triggered = currentValue > threshold;
      break;
    default:
      triggered = false;
  }
  
  return { triggered, currentValue, logs: filteredLogs };
}

router.get('/rules', async (ctx) => {
  const rules = alertRulesStore.read();
  ctx.body = { data: rules };
});

router.post('/rules', async (ctx) => {
  const { 
    name, 
    description, 
    condition, 
    level, 
    service, 
    keyword, 
    threshold,
    timeWindow,
    severity,
    enabled = true
  } = ctx.request.body;
  
  if (!name || !condition || threshold === undefined) {
    ctx.status = 400;
    ctx.body = { error: 'Name, condition and threshold are required' };
    return;
  }
  
  const rule = {
    id: uuidv4(),
    name,
    description: description || '',
    condition,
    level: level || null,
    service: service || null,
    keyword: keyword || null,
    threshold: parseFloat(threshold),
    timeWindow: timeWindow || 60000,
    severity: severity || 'MEDIUM',
    enabled,
    lastEvaluated: null,
    lastTriggered: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  alertRulesStore.append(rule);
  
  ctx.body = { success: true, data: rule };
});

router.put('/rules/:id', async (ctx) => {
  const { id } = ctx.params;
  const updates = ctx.request.body;
  
  const rules = alertRulesStore.read();
  const index = rules.findIndex(r => r.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { error: 'Rule not found' };
    return;
  }
  
  rules[index] = {
    ...rules[index],
    ...updates,
    updatedAt: Date.now()
  };
  
  alertRulesStore.write(rules);
  
  ctx.body = { success: true, data: rules[index] };
});

router.delete('/rules/:id', async (ctx) => {
  const { id } = ctx.params;
  
  const rules = alertRulesStore.read();
  const filteredRules = rules.filter(r => r.id !== id);
  
  if (filteredRules.length === rules.length) {
    ctx.status = 404;
    ctx.body = { error: 'Rule not found' };
    return;
  }
  
  alertRulesStore.write(filteredRules);
  
  ctx.body = { success: true };
});

router.post('/rules/evaluate', async (ctx) => {
  const logs = logsStore.read();
  const rules = alertRulesStore.read();
  
  const results = [];
  
  for (const rule of rules) {
    if (!rule.enabled) {
      results.push({ rule, skipped: true, reason: 'disabled' });
      continue;
    }
    
    const evaluation = evaluateRule(rule, logs);
    
    if (evaluation.triggered) {
      const existingAlerts = alertsStore.read();
      const existingAlert = existingAlerts.find(a => 
        a.ruleId === rule.id && 
        a.status !== 'RESOLVED' && 
        a.status !== 'CLOSED'
      );
      
      if (!existingAlert) {
        const alert = {
          id: uuidv4(),
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          status: 'OPEN',
          message: `Rule "${rule.name}" triggered: ${evaluation.currentValue}`,
          currentValue: evaluation.currentValue,
          threshold: rule.threshold,
          affectedLogs: evaluation.logs.slice(0, 10).map(l => l.id),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          acknowledgedBy: null,
          resolvedAt: null
        };
        
        alertsStore.append(alert);
      }
    }
    
    results.push({
      rule,
      triggered: evaluation.triggered,
      currentValue: evaluation.currentValue
    });
    
    const rulesData = alertRulesStore.read();
    const ruleIndex = rulesData.findIndex(r => r.id === rule.id);
    if (ruleIndex !== -1) {
      rulesData[ruleIndex].lastEvaluated = Date.now();
      if (evaluation.triggered) {
        rulesData[ruleIndex].lastTriggered = Date.now();
      }
      alertRulesStore.write(rulesData);
    }
  }
  
  ctx.body = { success: true, results };
});

router.get('/', async (ctx) => {
  const { status, severity, limit = 100, offset = 0 } = ctx.query;
  
  let alerts = alertsStore.read();
  
  if (status) {
    const statuses = Array.isArray(status) ? status : [status];
    alerts = alerts.filter(a => statuses.includes(a.status));
  }
  
  if (severity) {
    const severities = Array.isArray(severity) ? severity : [severity];
    alerts = alerts.filter(a => severities.includes(a.severity));
  }
  
  alerts.sort((a, b) => b.createdAt - a.createdAt);
  
  const total = alerts.length;
  const paginated = alerts.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  
  ctx.body = {
    total,
    limit: parseInt(limit),
    offset: parseInt(offset),
    data: paginated
  };
});

router.get('/:id', async (ctx) => {
  const { id } = ctx.params;
  const alerts = alertsStore.read();
  const alert = alerts.find(a => a.id === id);
  
  if (!alert) {
    ctx.status = 404;
    ctx.body = { error: 'Alert not found' };
    return;
  }
  
  ctx.body = { data: alert };
});

router.put('/:id/acknowledge', async (ctx) => {
  const { id } = ctx.params;
  const { acknowledgedBy } = ctx.request.body;
  
  const alerts = alertsStore.read();
  const index = alerts.findIndex(a => a.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { error: 'Alert not found' };
    return;
  }
  
  alerts[index].status = 'ACKNOWLEDGED';
  alerts[index].acknowledgedBy = acknowledgedBy || 'system';
  alerts[index].updatedAt = Date.now();
  
  alertRulesStore.write(alerts);
  
  ctx.body = { success: true, data: alerts[index] };
});

router.put('/:id/resolve', async (ctx) => {
  const { id } = ctx.params;
  const { resolvedBy, resolution } = ctx.request.body;
  
  const alerts = alertsStore.read();
  const index = alerts.findIndex(a => a.id === id);
  
  if (index === -1) {
    ctx.status = 404;
    ctx.body = { error: 'Alert not found' };
    return;
  }
  
  alerts[index].status = 'RESOLVED';
  alerts[index].resolvedBy = resolvedBy || 'system';
  alerts[index].resolution = resolution || '';
  alerts[index].resolvedAt = Date.now();
  alerts[index].updatedAt = Date.now();
  
  alertRulesStore.write(alerts);
  
  ctx.body = { success: true, data: alerts[index] };
});

module.exports = router;
