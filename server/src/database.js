import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'feed.db');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      username TEXT NOT NULL,
      avatar TEXT NOT NULL,
      content TEXT NOT NULL,
      images TEXT,
      createdAt INTEGER NOT NULL
    )
  `);

  const count = db.prepare('SELECT COUNT(*) as count FROM posts').get().count;
  
  if (count === 0) {
    seedData();
  }
}

function seedData() {
  const users = [
    { id: 'user_001', username: '旅行者', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
    { id: 'user_002', username: '星空探索者', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
    { id: 'user_003', username: '美食家', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
    { id: 'user_004', username: '摄影师', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
    { id: 'user_005', username: '程序员', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eva' },
    { id: 'user_006', username: '设计师', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank' }
  ];

  const contents = [
    '今天的日落真的太美了！🌅 站在山顶看着太阳慢慢落下，整个天空都变成了金黄色。',
    '刚刚学会了一个新的编程技巧，分享给大家！代码不仅仅是工具，更是艺术。💻',
    '周末去了一家新开的咖啡店，环境真的超赞！☕ 推荐拿铁，口感丝滑。',
    '读了一本非常棒的书，改变了我对很多事情的看法。推荐给大家！📚',
    '今天去爬山了，虽然很累，但是山顶的风景真的值得！🏔️',
    '分享一下我最近的摄影作品，希望大家喜欢！📷 生活中处处都是美。',
    '学习了一个新的设计软件，感觉打开了新世界的大门！🎨',
    '今天和朋友聚会，聊了很多，感觉生活真的很美好！👥',
    '尝试做了一道新菜，虽然卖相一般，但味道还不错！下次继续努力 🍳',
    '晚上看星星，感觉自己很渺小，但同时也觉得很自由。✨',
    '最近在学习吉他，手指很疼，但每次能弹出新的和弦都很开心！🎸',
    '今天天气真好，适合出去走走。发现了一家隐藏在小巷子里的书店！📖',
    '分享一下我的健身计划，坚持了三个月，效果真的很明显！💪',
    '看了一部很棒的电影，感动得哭了。好的作品总能触动人心。🎬',
    '今天收到了一个惊喜礼物，是朋友送的，真的太开心了！🎁',
    '尝试了新的发型，感觉焕然一新！有时候改变一下也不错。💇',
    '周末去露营了，第一次自己搭帐篷，很有成就感！⛺',
    '学习了一个新的语言，虽然很难，但每次进步都很兴奋！🌍',
    '今天去了美术馆，被一幅画深深吸引，站在那里看了很久。🎭',
    '分享一下我的养花日常，看到它们慢慢成长真的很治愈！🌸'
  ];

  const imageSets = [
    ['https://picsum.photos/seed/post1/600/400'],
    ['https://picsum.photos/seed/post2/600/400', 'https://picsum.photos/seed/post2b/600/400'],
    ['https://picsum.photos/seed/post3/600/400', 'https://picsum.photos/seed/post3b/600/400', 'https://picsum.photos/seed/post3c/600/400'],
    [],
    ['https://picsum.photos/seed/post5/600/400'],
    ['https://picsum.photos/seed/post6/600/400', 'https://picsum.photos/seed/post6b/600/400'],
    [],
    ['https://picsum.photos/seed/post8/600/400'],
    ['https://picsum.photos/seed/post9/600/400', 'https://picsum.photos/seed/post9b/600/400'],
    ['https://picsum.photos/seed/post10/600/400', 'https://picsum.photos/seed/post10b/600/400', 'https://picsum.photos/seed/post10c/600/400']
  ];

  const now = Date.now();
  const insert = db.prepare(`
    INSERT INTO posts (userId, username, avatar, content, images, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    for (let i = 0; i < 50; i++) {
      const user = users[i % users.length];
      const content = contents[i % contents.length];
      const images = imageSets[i % imageSets.length];
      const createdAt = now - (i * 3600000) - Math.random() * 1800000;
      
      insert.run(
        user.id,
        user.username,
        user.avatar,
        content,
        JSON.stringify(images),
        Math.floor(createdAt)
      );
    }
  });

  transaction();
  console.log('Database seeded with 50 posts');
}

export function getPosts(limit = 10, cursor = null) {
  let query = 'SELECT * FROM posts';
  const params = [];

  if (cursor) {
    query += ' WHERE createdAt < ?';
    params.push(cursor);
  }

  query += ' ORDER BY createdAt DESC LIMIT ?';
  params.push(limit + 1);

  const posts = db.prepare(query).all(...params);
  
  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? items[items.length - 1].createdAt : null;

  return {
    items: items.map(post => ({
      ...post,
      images: JSON.parse(post.images || '[]')
    })),
    hasMore,
    nextCursor
  };
}

export function getPostById(id) {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  if (!post) return null;
  
  return {
    ...post,
    images: JSON.parse(post.images || '[]')
  };
}

export function createPost(data) {
  const now = Date.now();
  const result = db.prepare(`
    INSERT INTO posts (userId, username, avatar, content, images, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    data.userId,
    data.username,
    data.avatar,
    data.content,
    JSON.stringify(data.images || []),
    now
  );

  return getPostById(result.lastInsertRowid);
}
