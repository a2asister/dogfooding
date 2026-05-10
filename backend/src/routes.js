import Router from '@koa/router';
import db from './db.js';
import { v4 as uuidv4 } from 'uuid';

const router = new Router({ prefix: '/api' });

router.get('/activities', async (ctx) => {
  const activities = db.prepare('SELECT * FROM activities ORDER BY created_at DESC').all();
  ctx.body = activities;
});

router.get('/activities/:id', async (ctx) => {
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(ctx.params.id);
  if (!activity) {
    ctx.status = 404;
    ctx.body = { error: 'Activity not found' };
    return;
  }
  ctx.body = activity;
});

router.post('/activities', async (ctx) => {
  const { name, description, location, start_time, end_time, max_participants, budget, expected_revenue } = ctx.request.body;
  const id = uuidv4();
  db.prepare(`
    INSERT INTO activities (id, name, description, location, start_time, end_time, max_participants, budget, expected_revenue, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(id, name, description, location, start_time, end_time, max_participants, budget, expected_revenue);
  
  db.prepare('INSERT INTO roi_metrics (id, activity_id) VALUES (?, ?)').run(uuidv4(), id);
  
  ctx.body = { id, ...ctx.request.body };
});

router.put('/activities/:id', async (ctx) => {
  const { name, description, location, start_time, end_time, max_participants, budget, expected_revenue, status } = ctx.request.body;
  const result = db.prepare(`
    UPDATE activities 
    SET name = ?, description = ?, location = ?, start_time = ?, end_time = ?, 
        max_participants = ?, budget = ?, expected_revenue = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, description, location, start_time, end_time, max_participants, budget, expected_revenue, status, ctx.params.id);
  
  if (result.changes === 0) {
    ctx.status = 404;
    ctx.body = { error: 'Activity not found' };
    return;
  }
  ctx.body = { success: true };
});

router.delete('/activities/:id', async (ctx) => {
  const result = db.prepare('DELETE FROM activities WHERE id = ?').run(ctx.params.id);
  if (result.changes === 0) {
    ctx.status = 404;
    ctx.body = { error: 'Activity not found' };
    return;
  }
  ctx.body = { success: true };
});

router.get('/activities/:id/registrations', async (ctx) => {
  const registrations = db.prepare(`
    SELECT r.*, 
      CASE 
        WHEN r.checkin_time IS NOT NULL THEN 'checked_in'
        ELSE r.status 
      END as display_status
    FROM registrations r 
    WHERE r.activity_id = ? 
    ORDER BY r.registration_time DESC
  `).all(ctx.params.id);
  ctx.body = registrations;
});

router.post('/activities/:id/register', async (ctx) => {
  const { user_name, phone, email, company, position } = ctx.request.body;
  const activityId = ctx.params.id;
  
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(activityId);
  if (!activity) {
    ctx.status = 404;
    ctx.body = { error: 'Activity not found' };
    return;
  }
  
  if (activity.current_participants >= activity.max_participants) {
    ctx.status = 400;
    ctx.body = { error: 'Activity is full' };
    return;
  }
  
  try {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO registrations (id, activity_id, user_name, phone, email, company, position)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, activityId, user_name, phone, email, company, position);
    
    db.prepare('UPDATE activities SET current_participants = current_participants + 1 WHERE id = ?').run(activityId);
    
    ctx.body = { id, ...ctx.request.body };
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      ctx.status = 400;
      ctx.body = { error: 'Already registered for this activity' };
      return;
    }
    throw err;
  }
});

router.post('/registrations/:id/checkin', async (ctx) => {
  const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(ctx.params.id);
  if (!registration) {
    ctx.status = 404;
    ctx.body = { error: 'Registration not found' };
    return;
  }
  
  if (registration.checkin_time) {
    ctx.status = 400;
    ctx.body = { error: 'Already checked in' };
    return;
  }
  
  db.prepare('UPDATE registrations SET checkin_time = CURRENT_TIMESTAMP, status = ? WHERE id = ?').run('checked_in', ctx.params.id);
  
  const roi = db.prepare('SELECT * FROM roi_metrics WHERE activity_id = ?').get(registration.activity_id);
  if (roi) {
    db.prepare('UPDATE roi_metrics SET actual_attendees = actual_attendees + 1, updated_at = CURRENT_TIMESTAMP WHERE activity_id = ?').run(registration.activity_id);
  }
  
  ctx.body = { success: true };
});

router.post('/registrations/:id/checkout', async (ctx) => {
  const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(ctx.params.id);
  if (!registration) {
    ctx.status = 404;
    ctx.body = { error: 'Registration not found' };
    return;
  }
  
  if (!registration.checkin_time) {
    ctx.status = 400;
    ctx.body = { error: 'Not checked in yet' };
    return;
  }
  
  if (registration.checkout_time) {
    ctx.status = 400;
    ctx.body = { error: 'Already checked out' };
    return;
  }
  
  db.prepare('UPDATE registrations SET checkout_time = CURRENT_TIMESTAMP, status = ? WHERE id = ?').run('completed', ctx.params.id);
  ctx.body = { success: true };
});

router.post('/registrations/:id/absent', async (ctx) => {
  const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(ctx.params.id);
  if (!registration) {
    ctx.status = 404;
    ctx.body = { error: 'Registration not found' };
    return;
  }
  
  if (registration.checkin_time) {
    ctx.status = 400;
    ctx.body = { error: 'User already checked in' };
    return;
  }
  
  db.prepare('UPDATE registrations SET status = ? WHERE id = ?').run('absent', ctx.params.id);
  ctx.body = { success: true };
});

router.post('/registrations/:id/revert', async (ctx) => {
  const registration = db.prepare('SELECT * FROM registrations WHERE id = ?').get(ctx.params.id);
  if (!registration) {
    ctx.status = 404;
    ctx.body = { error: 'Registration not found' };
    return;
  }
  
  const wasCheckedIn = registration.checkin_time !== null;
  
  db.prepare('UPDATE registrations SET checkin_time = NULL, checkout_time = NULL, status = ? WHERE id = ?').run('registered', ctx.params.id);
  
  if (wasCheckedIn) {
    const roi = db.prepare('SELECT * FROM roi_metrics WHERE activity_id = ?').get(registration.activity_id);
    if (roi && roi.actual_attendees > 0) {
      db.prepare('UPDATE roi_metrics SET actual_attendees = actual_attendees - 1, updated_at = CURRENT_TIMESTAMP WHERE activity_id = ?').run(registration.activity_id);
    }
  }
  
  ctx.body = { success: true };
});

router.get('/activities/:id/stats', async (ctx) => {
  const activityId = ctx.params.id;
  
  const totalRegistrations = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE activity_id = ?').get(activityId).count;
  const checkedIn = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE activity_id = ? AND checkin_time IS NOT NULL').get(activityId).count;
  const checkedOut = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE activity_id = ? AND checkout_time IS NOT NULL').get(activityId).count;
  const absent = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE activity_id = ? AND status = ?').get(activityId, 'absent').count;
  
  ctx.body = {
    totalRegistrations,
    checkedIn,
    checkedOut,
    absent,
    registered: totalRegistrations - checkedIn - absent
  };
});

router.get('/activities/:id/user-segments', async (ctx) => {
  const activityId = ctx.params.id;
  
  const segments = db.prepare(`
    SELECT 
      CASE
        WHEN interaction_count >= 5 THEN 'highly_engaged'
        WHEN interaction_count >= 2 THEN 'moderately_engaged'
        WHEN interaction_count >= 1 THEN 'lightly_engaged'
        ELSE 'passive'
      END as segment,
      COUNT(*) as count
    FROM registrations
    WHERE activity_id = ?
    GROUP BY segment
  `).all(activityId);
  
  const result = {
    highly_engaged: 0,
    moderately_engaged: 0,
    lightly_engaged: 0,
    passive: 0
  };
  
  segments.forEach(s => {
    result[s.segment] = s.count;
  });
  
  ctx.body = result;
});

router.get('/activities/:id/roi', async (ctx) => {
  const activityId = ctx.params.id;
  
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(activityId);
  if (!activity) {
    ctx.status = 404;
    ctx.body = { error: 'Activity not found' };
    return;
  }
  
  const roi = db.prepare('SELECT * FROM roi_metrics WHERE activity_id = ?').get(activityId);
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_registrations,
      SUM(CASE WHEN checkin_time IS NOT NULL THEN 1 ELSE 0 END) as actual_attendees,
      SUM(interaction_count) as total_interactions
    FROM registrations 
    WHERE activity_id = ?
  `).get(activityId);
  
  const actualCost = activity.budget + (roi?.marketing_cost || 0);
  const roiPercentage = actualCost > 0 ? ((roi?.actual_revenue || 0) - actualCost) / actualCost * 100 : 0;
  const conversionRate = stats.total_registrations > 0 ? (roi?.conversions || 0) / stats.total_registrations * 100 : 0;
  
  ctx.body = {
    budget: activity.budget,
    expectedRevenue: activity.expected_revenue,
    actualCost,
    actualRevenue: roi?.actual_revenue || 0,
    roi: roiPercentage,
    conversionRate,
    totalRegistrations: stats.total_registrations,
    actualAttendees: stats.actual_attendees || 0,
    totalInteractions: stats.total_interactions || 0,
    newLeads: roi?.new_leads || 0,
    conversions: roi?.conversions || 0
  };
});

router.put('/activities/:id/roi', async (ctx) => {
  const { actual_revenue, marketing_cost, new_leads, conversions } = ctx.request.body;
  
  const result = db.prepare(`
    UPDATE roi_metrics 
    SET actual_revenue = ?, marketing_cost = ?, new_leads = ?, conversions = ?, updated_at = CURRENT_TIMESTAMP
    WHERE activity_id = ?
  `).run(actual_revenue, marketing_cost, new_leads, conversions, ctx.params.id);
  
  if (result.changes === 0) {
    ctx.status = 404;
    ctx.body = { error: 'ROI metrics not found' };
    return;
  }
  ctx.body = { success: true };
});

router.post('/activities/:id/interactions', async (ctx) => {
  const { registration_id, user_phone, type, content } = ctx.request.body;
  const activityId = ctx.params.id;
  
  const id = uuidv4();
  db.prepare(`
    INSERT INTO interactions (id, activity_id, registration_id, user_phone, type, content)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, activityId, registration_id, user_phone, type, content);
  
  if (registration_id) {
    db.prepare('UPDATE registrations SET interaction_count = interaction_count + 1 WHERE id = ?').run(registration_id);
  }
  
  ctx.body = { id, ...ctx.request.body };
});

router.get('/activities/:id/interactions', async (ctx) => {
  const interactions = db.prepare(`
    SELECT i.*, r.user_name, r.phone
    FROM interactions i
    LEFT JOIN registrations r ON i.registration_id = r.id
    WHERE i.activity_id = ?
    ORDER BY i.created_at DESC
  `).all(ctx.params.id);
  ctx.body = interactions;
});

router.get('/dashboard', async (ctx) => {
  const totalActivities = db.prepare('SELECT COUNT(*) as count FROM activities').get().count;
  const activeActivities = db.prepare("SELECT COUNT(*) as count FROM activities WHERE status = 'active'").get().count;
  
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_registrations,
      SUM(CASE WHEN r.checkin_time IS NOT NULL THEN 1 ELSE 0 END) as total_checkins
    FROM registrations r
  `).get();
  
  const activityStats = db.prepare(`
    SELECT a.id, a.name, a.status, a.max_participants, a.current_participants,
      SUM(CASE WHEN r.checkin_time IS NOT NULL THEN 1 ELSE 0 END) as checkins
    FROM activities a
    LEFT JOIN registrations r ON a.id = r.activity_id
    GROUP BY a.id
    ORDER BY a.created_at DESC
    LIMIT 10
  `).all();
  
  ctx.body = {
    totalActivities,
    activeActivities,
    totalRegistrations: stats.total_registrations || 0,
    totalCheckins: stats.total_checkins || 0,
    activityStats
  };
});

export default router;
