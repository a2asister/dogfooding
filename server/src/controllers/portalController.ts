import { Context } from 'koa';
import { getDB } from '../models/database';
import { successResponse } from '../utils/auth';

export async function getNewsList(ctx: Context): Promise<void> {
  const { category, page = 1, pageSize = 10 } = ctx.query as any;
  const db = getDB();

  let sql = 'SELECT * FROM news';
  const countSql = 'SELECT COUNT(*) as total FROM news';
  const params: any[] = [];
  const countParams: any[] = [];

  if (category) {
    sql += ' WHERE category = ?';
    countSql += ' WHERE category = ?';
    params.push(category);
    countParams.push(category);
  }

  sql += ' ORDER BY publish_time DESC LIMIT ? OFFSET ?';
  params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));

  const news = db.prepare(sql).all(...params);
  const { total } = db.prepare(countSql).get(...countParams) as any;

  ctx.body = successResponse({
    list: news,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
  });
}

export async function getNewsDetail(ctx: Context): Promise<void> {
  const { id } = ctx.params;
  const db = getDB();

  const news = db.prepare('SELECT * FROM news WHERE id = ?').get(id);
  if (!news) {
    ctx.body = successResponse(null, '新闻不存在');
    return;
  }

  db.prepare('UPDATE news SET views = views + 1 WHERE id = ?').run(id);

  ctx.body = successResponse(news);
}

export async function getOverview(ctx: Context): Promise<void> {
  const db = getDB();

  const latestNews = db.prepare('SELECT * FROM news ORDER BY publish_time DESC LIMIT 5').all();
  const notices = db.prepare("SELECT * FROM news WHERE category = '通知公告' ORDER BY publish_time DESC LIMIT 5").all();

  const banners = [
    { id: 1, title: '欢迎来到大学门户', image: '/banner1.jpg', link: '/about' },
    { id: 2, title: '2024年招生专题', image: '/banner2.jpg', link: '/admission' },
    { id: 3, title: '校园文化艺术节', image: '/banner3.jpg', link: '/news' },
  ];

  const quickLinks = [
    { name: '教务系统', link: '/student/dashboard' },
    { name: '图书馆', link: '/services' },
    { name: '招生就业', link: '/admission' },
    { name: '校园邮箱', link: '#' },
    { name: 'VPN服务', link: '#' },
    { name: '校长信箱', link: '#' },
  ];

  ctx.body = successResponse({
    banners,
    latestNews,
    notices,
    quickLinks,
  });
}
