import db from './db.js';
import { LEVEL_CONFIG, POINT_RULES } from './types.js';

export function calculateLevel(points: number): number {
  let level = 1;
  for (const config of LEVEL_CONFIG) {
    if (points >= config.minPoints) {
      level = config.level;
    } else {
      break;
    }
  }
  return level;
}

export function addPoints(userId: number, action: string, points: number, description: string, relatedId?: number, relatedType?: string): void {
  const tx = db.transaction(() => {
    const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as { points: number } | undefined;
    if (!user) return;

    let newPoints = user.points + points;
    if (newPoints < 0) newPoints = 0;

    const newLevel = calculateLevel(newPoints);
    db.prepare('UPDATE users SET points = ?, level = ? WHERE id = ?').run(newPoints, newLevel, userId);
    db.prepare('INSERT INTO point_logs (user_id, action, points, description, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)')
      .run(userId, action, points, description, relatedId ?? null, relatedType ?? null);

    if (points === POINT_RULES.CHEAT) {
      db.prepare("UPDATE users SET status = 'banned' WHERE id = ?").run(userId);
    }
  });
  tx();
}

export function createNotification(userId: number, type: string, content: string, relatedId?: number, relatedType?: string): void {
  db.prepare('INSERT INTO notifications (user_id, type, content, related_id, related_type) VALUES (?, ?, ?, ?, ?)')
    .run(userId, type, content, relatedId ?? null, relatedType ?? null);
}

export function updateTags(tagNames: string[]): void {
  const tx = db.transaction(() => {
    for (const name of tagNames) {
      const tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(name) as { id: number } | undefined;
      if (tag) {
        db.prepare('UPDATE tags SET usage_count = usage_count + 1 WHERE id = ?').run(tag.id);
      } else {
        db.prepare('INSERT INTO tags (name) VALUES (?)').run(name);
      }
    }
  });
  tx();
}

export function checkBadges(userId: number): void {
  const counts = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM articles WHERE user_id = ? AND status = 'approved') as articles,
      (SELECT COUNT(*) FROM projects WHERE user_id = ?) as projects,
      (SELECT SUM(likes) FROM articles WHERE user_id = ?) as article_likes,
      (SELECT SUM(likes) FROM questions WHERE user_id = ?) as question_likes,
      (SELECT COUNT(*) FROM answers a WHERE a.user_id = ? AND a.is_accepted = 1) as accepted_answers,
      (SELECT COUNT(*) FROM resources WHERE user_id = ?) as resources,
      (SELECT points FROM users WHERE id = ?) as points,
      (SELECT COUNT(*) FROM daily_check_ins WHERE user_id = ?) as checkins
  `).get(userId, userId, userId, userId, userId, userId, userId, userId) as {
    articles: number;
    projects: number;
    article_likes: number | null;
    question_likes: number | null;
    accepted_answers: number;
    resources: number;
    points: number;
    checkins: number;
  };

  const totalLikes = (counts.article_likes ?? 0) + (counts.question_likes ?? 0);
  const earnedBadges: string[] = [];

  if (counts.articles >= 1) earnedBadges.push('first_article');
  if (counts.accepted_answers >= 10) earnedBadges.push('accepted_answers_10');
  if (counts.articles >= 50) earnedBadges.push('articles_50');
  if (counts.projects >= 5) earnedBadges.push('projects_5');
  if (totalLikes >= 1000) earnedBadges.push('likes_1000');
  if (counts.points >= 2000) earnedBadges.push('points_2000');
  if (counts.checkins >= 30) earnedBadges.push('checkin_30');
  if (counts.resources >= 100) earnedBadges.push('resources_100');

  const tx = db.transaction(() => {
    for (const condition of earnedBadges) {
      const badge = db.prepare('SELECT id FROM badges WHERE condition = ?').get(condition) as { id: number } | undefined;
      if (badge) {
        const existing = db.prepare('SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?').get(userId, badge.id);
        if (!existing) {
          db.prepare('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(userId, badge.id);
          createNotification(userId, 'system', `🎉 恭喜获得新徽章！`, badge.id, 'badge');
        }
      }
    }
  });
  tx();
}

export function parseTags(tagsStr: string): string[] {
  return tagsStr.split(',').map(t => t.trim()).filter(Boolean);
}
