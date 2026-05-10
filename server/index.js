import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dbModule from './database.js';

const app = express();
const PORT = 34567;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 迭代管理 API
app.get('/api/iterations', (req, res) => {
  const iterations = dbModule.prepare('SELECT * FROM iterations ORDER BY start_date DESC').all();
  res.json(iterations);
});

app.post('/api/iterations', (req, res) => {
  const { name, version, start_date, end_date, description } = req.body;
  const id = uuidv4();
  dbModule.prepare(`
    INSERT INTO iterations (id, name, version, start_date, end_date, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name, version, start_date, end_date, description);
  res.json({ id });
});

app.put('/api/iterations/:id', (req, res) => {
  const { name, version, start_date, end_date, status, description } = req.body;
  dbModule.prepare(`
    UPDATE iterations SET name=?, version=?, start_date=?, end_date=?, status=?, description=?, updated_at=datetime('now')
    WHERE id=?
  `).run(name, version, start_date, end_date, status, description, req.params.id);
  res.json({ success: true });
});

app.delete('/api/iterations/:id', (req, res) => {
  dbModule.prepare('DELETE FROM iterations WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// 需求管理 API
app.get('/api/requirements', (req, res) => {
  const requirements = dbModule.prepare('SELECT * FROM requirements ORDER BY created_at DESC').all();
  res.json(requirements);
});

app.get('/api/requirements/:id', (req, res) => {
  const requirement = dbModule.prepare('SELECT * FROM requirements WHERE id=?').get(req.params.id);
  res.json(requirement);
});

app.post('/api/requirements', (req, res) => {
  const { title, description, priority, iteration_id, assignee, estimated_hours } = req.body;
  const id = uuidv4();
  dbModule.prepare(`
    INSERT INTO requirements (id, title, description, priority, iteration_id, assignee, estimated_hours)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, description, priority, iteration_id, assignee, estimated_hours);
  res.json({ id });
});

app.put('/api/requirements/:id', (req, res) => {
  const oldRequirement = dbModule.prepare('SELECT * FROM requirements WHERE id=?').get(req.params.id);
  const { title, description, priority, status, iteration_id, assignee, estimated_hours, actual_hours } = req.body;
  
  const changes = [];
  if (oldRequirement && oldRequirement.title !== title) changes.push({ field: 'title', old: oldRequirement.title, new: title });
  if (oldRequirement && oldRequirement.description !== description) changes.push({ field: 'description', old: oldRequirement.description, new: description });
  if (oldRequirement && oldRequirement.priority !== priority) changes.push({ field: 'priority', old: oldRequirement.priority, new: priority });
  if (oldRequirement && oldRequirement.status !== status) changes.push({ field: 'status', old: oldRequirement.status, new: status });
  if (oldRequirement && oldRequirement.iteration_id !== iteration_id) changes.push({ field: 'iteration_id', old: oldRequirement.iteration_id, new: iteration_id });
  
  changes.forEach(change => {
    const changeId = uuidv4();
    dbModule.prepare(`
      INSERT INTO requirement_changes (id, requirement_id, change_type, old_value, new_value, reason, impact_scope, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(changeId, req.params.id, change.field, JSON.stringify(change.old), JSON.stringify(change.new), '更新', '影响范围需要评估', 'system');
  });
  
  dbModule.prepare(`
    UPDATE requirements SET title=?, description=?, priority=?, status=?, iteration_id=?, assignee=?, estimated_hours=?, actual_hours=?, updated_at=datetime('now')
    WHERE id=?
  `).run(title, description, priority, status, iteration_id, assignee, estimated_hours, actual_hours, req.params.id);
  res.json({ success: true });
});

app.delete('/api/requirements/:id', (req, res) => {
  dbModule.prepare('DELETE FROM requirements WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// 需求变更 API
app.get('/api/requirements/:id/changes', (req, res) => {
  const changes = dbModule.prepare('SELECT * FROM requirement_changes WHERE requirement_id=? ORDER BY created_at DESC').all(req.params.id);
  res.json(changes);
});

// Bug 管理 API
app.get('/api/bugs', (req, res) => {
  const bugs = dbModule.prepare('SELECT * FROM bugs ORDER BY created_at DESC').all();
  res.json(bugs);
});

app.post('/api/bugs', (req, res) => {
  const { title, description, severity, status, assignee, requirement_id, iteration_id } = req.body;
  const id = uuidv4();
  dbModule.prepare(`
    INSERT INTO bugs (id, title, description, severity, status, assignee, requirement_id, iteration_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, description, severity, status, assignee, requirement_id, iteration_id);
  res.json({ id });
});

app.put('/api/bugs/:id', (req, res) => {
  const { title, description, severity, status, assignee, requirement_id, iteration_id } = req.body;
  dbModule.prepare(`
    UPDATE bugs SET title=?, description=?, severity=?, status=?, assignee=?, requirement_id=?, iteration_id=?, updated_at=datetime('now')
    WHERE id=?
  `).run(title, description, severity, status, assignee, requirement_id, iteration_id, req.params.id);
  res.json({ success: true });
});

app.delete('/api/bugs/:id', (req, res) => {
  dbModule.prepare('DELETE FROM bugs WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// 部署管理 API
app.get('/api/deployments', (req, res) => {
  const deployments = dbModule.prepare('SELECT * FROM deployments ORDER BY created_at DESC').all();
  res.json(deployments);
});

app.post('/api/deployments', (req, res) => {
  const { iteration_id, environment, status, grayscale_percentage } = req.body;
  const id = uuidv4();
  dbModule.prepare(`
    INSERT INTO deployments (id, iteration_id, environment, status, grayscale_percentage)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, iteration_id, environment, status, grayscale_percentage);
  res.json({ id });
});

app.put('/api/deployments/:id', (req, res) => {
  const { status, grayscale_percentage, grayscale_users } = req.body;
  const updateFields = ['status=?', 'grayscale_percentage=?', 'grayscale_users=?'];
  const params = [status, grayscale_percentage, grayscale_users];
  
  if (status === 'deployed') {
    updateFields.push('deployed_at=datetime(\'now\')');
  } else if (status === 'rolled_back') {
    updateFields.push('rollback_at=datetime(\'now\')');
  }
  
  params.push(req.params.id);
  
  dbModule.prepare(`UPDATE deployments SET ${updateFields.join(', ')} WHERE id=?`).run(...params);
  res.json({ success: true });
});

// 复盘管理 API
app.get('/api/retrospectives', (req, res) => {
  const retrospectives = dbModule.prepare('SELECT * FROM retrospectives ORDER BY created_at DESC').all();
  res.json(retrospectives);
});

app.post('/api/retrospectives', (req, res) => {
  const { iteration_id, went_well, improvements, action_items, velocity, bug_rate, completion_rate } = req.body;
  const id = uuidv4();
  dbModule.prepare(`
    INSERT INTO retrospectives (id, iteration_id, went_well, improvements, action_items, velocity, bug_rate, completion_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, iteration_id, went_well, improvements, action_items, velocity, bug_rate, completion_rate);
  res.json({ id });
});

// 用户反馈 API
app.get('/api/feedbacks', (req, res) => {
  const feedbacks = dbModule.prepare('SELECT * FROM feedbacks ORDER BY created_at DESC').all();
  res.json(feedbacks);
});

app.post('/api/feedbacks', (req, res) => {
  const { user_name, content, category, related_requirement_id, status } = req.body;
  const id = uuidv4();
  dbModule.prepare(`
    INSERT INTO feedbacks (id, user_name, content, category, related_requirement_id, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, user_name, content, category, related_requirement_id, status);
  res.json({ id });
});

app.put('/api/feedbacks/:id', (req, res) => {
  const { status } = req.body;
  dbModule.prepare('UPDATE feedbacks SET status=? WHERE id=?').run(status, req.params.id);
  res.json({ success: true });
});

// 任务管理 API
app.get('/api/tasks', (req, res) => {
  const tasks = dbModule.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { requirement_id, title, description, status, assignee, estimated_hours, actual_hours, start_date, end_date } = req.body;
  const id = uuidv4();
  dbModule.prepare(`
    INSERT INTO tasks (id, requirement_id, title, description, status, assignee, estimated_hours, actual_hours, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, requirement_id, title, description, status, assignee, estimated_hours, actual_hours, start_date, end_date);
  res.json({ id });
});

app.put('/api/tasks/:id', (req, res) => {
  const { title, description, status, assignee, estimated_hours, actual_hours, start_date, end_date } = req.body;
  dbModule.prepare(`
    UPDATE tasks SET title=?, description=?, status=?, assignee=?, estimated_hours=?, actual_hours=?, start_date=?, end_date=?, updated_at=datetime('now')
    WHERE id=?
  `).run(title, description, status, assignee, estimated_hours, actual_hours, start_date, end_date, req.params.id);
  res.json({ success: true });
});

// 评审管理 API
app.get('/api/reviews', (req, res) => {
  const reviews = dbModule.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  const { requirement_id, reviewer, status, comments } = req.body;
  const id = uuidv4();
  dbModule.prepare(`
    INSERT INTO reviews (id, requirement_id, reviewer, status, comments)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, requirement_id, reviewer, status, comments);
  res.json({ id });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
