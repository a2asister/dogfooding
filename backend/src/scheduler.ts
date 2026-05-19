import db from './database/db';

const checkScheduledContent = (): void => {
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE news 
    SET status = 'published', 
        publish_time = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE status = 'draft' 
      AND scheduled_publish_time IS NOT NULL 
      AND scheduled_publish_time <= ?
  `).run(now);

  db.prepare(`
    UPDATE news 
    SET status = 'offline',
        updated_at = CURRENT_TIMESTAMP
    WHERE status = 'published' 
      AND scheduled_offline_time IS NOT NULL 
      AND scheduled_offline_time <= ?
  `).run(now);

  db.prepare(`
    UPDATE events 
    SET is_published = 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE is_published = 0 
      AND scheduled_publish_time IS NOT NULL 
      AND scheduled_publish_time <= ?
  `).run(now);

  db.prepare(`
    UPDATE events 
    SET is_published = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE is_published = 1 
      AND scheduled_offline_time IS NOT NULL 
      AND scheduled_offline_time <= ?
  `).run(now);
};

let timer: ReturnType<typeof setInterval> | null = null;

export const startScheduler = (): void => {
  if (timer) return;
  
  console.log('⏰ 定时任务调度器已启动');
  checkScheduledContent();
  
  timer = setInterval(() => {
    checkScheduledContent();
  }, 60 * 1000);
};

export const stopScheduler = (): void => {
  if (timer) {
    clearInterval(timer);
    timer = null;
    console.log('⏰ 定时任务调度器已停止');
  }
};
