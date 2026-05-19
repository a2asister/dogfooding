import db from '../database/db';

export interface Statistics {
  id: number;
  stat_date: string;
  pv: number;
  uv: number;
  downloads: number;
  reservations: number;
  news_views: number;
  event_clicks: number;
  tickets: number;
  created_at: string;
}

export const statisticsModel = {
  getByDateRange: (startDate: string, endDate: string): Statistics[] => {
    return db.prepare(`
      SELECT * FROM statistics 
      WHERE stat_date BETWEEN ? AND ? 
      ORDER BY stat_date ASC
    `).all(startDate, endDate) as Statistics[];
  },

  getByDate: (date: string): Statistics | undefined => {
    return db.prepare('SELECT * FROM statistics WHERE stat_date = ?').get(date) as Statistics | undefined;
  },

  increment: (date: string, field: keyof Omit<Statistics, 'id' | 'stat_date' | 'created_at'>, amount: number = 1): void => {
    const existing = db.prepare('SELECT id FROM statistics WHERE stat_date = ?').get(date) as { id: number } | undefined;

    if (existing) {
      db.prepare(`UPDATE statistics SET ${field} = ${field} + ? WHERE stat_date = ?`).run(amount, date);
    } else {
      db.prepare(`INSERT INTO statistics (stat_date, ${field}) VALUES (?, ?)`).run(date, amount);
    }
  },

  getSummary: (period: 'day' | 'week' | 'month'): {
    pv: number;
    uv: number;
    downloads: number;
    reservations: number;
    news_views: number;
    event_clicks: number;
    tickets: number;
    trend: { date: string; value: number; field: string }[];
  } => {
    let dateCondition = '';
    const now = new Date();

    if (period === 'day') {
      const today = now.toISOString().split('T')[0];
      dateCondition = `stat_date = '${today}'`;
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      dateCondition = `stat_date >= '${weekAgo}'`;
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      dateCondition = `stat_date >= '${monthAgo}'`;
    }

    const result = db.prepare(`
      SELECT 
        COALESCE(SUM(pv), 0) as pv,
        COALESCE(SUM(uv), 0) as uv,
        COALESCE(SUM(downloads), 0) as downloads,
        COALESCE(SUM(reservations), 0) as reservations,
        COALESCE(SUM(news_views), 0) as news_views,
        COALESCE(SUM(event_clicks), 0) as event_clicks,
        COALESCE(SUM(tickets), 0) as tickets
      FROM statistics 
      WHERE ${dateCondition}
    `).get() as {
      pv: number;
      uv: number;
      downloads: number;
      reservations: number;
      news_views: number;
      event_clicks: number;
      tickets: number;
    };

    const trend = db.prepare(`
      SELECT stat_date as date, pv, uv, downloads, reservations, news_views, event_clicks, tickets
      FROM statistics 
      WHERE ${dateCondition}
      ORDER BY stat_date ASC
      LIMIT 30
    `).all() as { date: string; pv: number; uv: number; downloads: number; reservations: number; news_views: number; event_clicks: number; tickets: number }[];

    return {
      ...result,
      trend: trend.flatMap(row => [
        { date: row.date, value: row.pv, field: 'pv' },
        { date: row.date, value: row.uv, field: 'uv' },
        { date: row.date, value: row.downloads, field: 'downloads' },
        { date: row.date, value: row.reservations, field: 'reservations' },
        { date: row.date, value: row.news_views, field: 'news_views' },
        { date: row.date, value: row.event_clicks, field: 'event_clicks' },
        { date: row.date, value: row.tickets, field: 'tickets' }
      ])
    };
  }
};
