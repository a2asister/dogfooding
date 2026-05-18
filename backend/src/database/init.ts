import db from './db';
import bcrypt from 'bcryptjs';

const initDatabase = (): void => {
  console.log('开始初始化数据库...');

  db.exec(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'announcement',
      cover_image TEXT,
      is_top INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      cover_image TEXT,
      start_time DATETIME,
      end_time DATETIME,
      status TEXT DEFAULT 'upcoming',
      is_published INTEGER DEFAULT 0,
      link_url TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS home_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_name TEXT NOT NULL UNIQUE,
      config_data TEXT NOT NULL,
      is_enabled INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      platform TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT,
      contact TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      reply TEXT,
      replied_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS compliance_docs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_type TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
    CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at);
    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
    CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
  `);

  console.log('表结构创建完成');

  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
  if (adminCount.count === 0) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', passwordHash, 'superadmin');
    console.log('默认管理员账户创建完成: admin / admin123');
  }

  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (settingsCount.count === 0) {
    const defaultSettings = [
      { key: 'site_name', value: '星际幻想 - 官方网站', description: '网站名称' },
      { key: 'site_logo', value: '', description: '网站Logo' },
      { key: 'icp', value: '粤ICP备XXXXXXXX号', description: '备案信息' },
      { key: 'copyright', value: '© 2024 星际幻想. All rights reserved.', description: '版权信息' }
    ];
    
    const stmt = db.prepare('INSERT INTO settings (key, value, description) VALUES (?, ?, ?)');
    defaultSettings.forEach(setting => {
      stmt.run(setting.key, setting.value, setting.description);
    });
    console.log('默认系统设置创建完成');
  }

  const complianceCount = db.prepare('SELECT COUNT(*) as count FROM compliance_docs').get() as { count: number };
  if (complianceCount.count === 0) {
    const defaultDocs = [
      { doc_type: 'user_agreement', title: '用户协议', content: '<h1>用户协议</h1><p>欢迎使用我们的游戏服务...</p>' },
      { doc_type: 'privacy_policy', title: '隐私政策', content: '<h1>隐私政策</h1><p>我们非常重视您的隐私保护...</p>' },
      { doc_type: 'minor_protection', title: '未成年人保护政策', content: '<h1>未成年人保护政策</h1><p>为保护未成年人健康成长...</p>' },
      { doc_type: 'copyright', title: '版权声明', content: '<h1>版权声明</h1><p>本游戏所有内容版权归官方所有...</p>' }
    ];
    
    const stmt = db.prepare('INSERT INTO compliance_docs (doc_type, title, content) VALUES (?, ?, ?)');
    defaultDocs.forEach(doc => {
      stmt.run(doc.doc_type, doc.title, doc.content);
    });
    console.log('默认合规文档创建完成');
  }

  const homeConfigCount = db.prepare('SELECT COUNT(*) as count FROM home_config').get() as { count: number };
  if (homeConfigCount.count === 0) {
    const defaultBanners = JSON.stringify([
      { id: 1, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%20game%20banner%20futuristic%20dark%20blue%20neon&image_size=landscape_16_9', title: '星际幻想 正式上线', link: '/download' },
      { id: 2, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fantasy%20game%20world%20magic%20epic%20battle&image_size=landscape_16_9', title: '全新版本 破晓来临', link: '/news' },
      { id: 3, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=space%20galaxy%20game%20adventure%20stars%20cosmic&image_size=landscape_16_9', title: '跨服战场 荣耀开启', link: '/events' }
    ]);

    const defaultHighlights = JSON.stringify([
      { id: 1, icon: '🎮', title: '极致画质', description: '4K超清画面，沉浸式游戏体验' },
      { id: 2, icon: '⚔️', title: '多元战斗', description: '丰富技能组合，策略对决' },
      { id: 3, icon: '🌍', title: '开放世界', description: '超大地图自由探索' },
      { id: 4, icon: '👥', title: '社交互动', description: '组队副本，公会争霸' }
    ]);

    const defaultPreview = JSON.stringify([
      { id: 1, type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=game%20screenshot%20fantasy%20battle%20scene%20epic&image_size=landscape_16_9', title: '战斗场景' },
      { id: 2, type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=game%20character%20design%20warrior%20armor%20fantasy&image_size=landscape_16_9', title: '角色展示' },
      { id: 3, type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=game%20landscape%20fantasy%20world%20castle%20mountains&image_size=landscape_16_9', title: '世界风光' }
    ]);

    const defaultSocial = JSON.stringify([
      { id: 1, platform: 'wechat', qrcode: '', name: '官方微信公众号' },
      { id: 2, platform: 'qq', qrcode: '', name: '官方QQ群' },
      { id: 3, platform: 'weibo', qrcode: '', name: '官方微博' }
    ]);

    const homeConfigs = [
      { module_name: 'banners', config_data: defaultBanners, sort_order: 1 },
      { module_name: 'highlights', config_data: defaultHighlights, sort_order: 2 },
      { module_name: 'previews', config_data: defaultPreview, sort_order: 4 },
      { module_name: 'social', config_data: defaultSocial, sort_order: 5 }
    ];

    const stmt = db.prepare('INSERT INTO home_config (module_name, config_data, is_enabled, sort_order) VALUES (?, ?, 1, ?)');
    homeConfigs.forEach(config => {
      stmt.run(config.module_name, config.config_data, config.sort_order);
    });
    console.log('默认首页配置创建完成');
  }

  const newsCount = db.prepare('SELECT COUNT(*) as count FROM news').get() as { count: number };
  if (newsCount.count === 0) {
    const defaultNews = [
      { title: '《星际幻想》正式公测开启！', content: '<p>亲爱的玩家们，《星际幻想》正式公测现已全面开启！</p>', category: 'announcement', cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=game%20launch%20celebration%20fantasy%20epic&image_size=landscape_4_3', is_top: 1 },
      { title: '1.2版本更新公告', content: '<p>本次更新新增了多个副本和优化了游戏体验...</p>', category: 'version', cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=game%20update%20patch%20notes%20digital&image_size=landscape_4_3', is_top: 0 },
      { title: '春节限时活动即将开启', content: '<p>春节限定活动将在下周开启，海量奖励等你来拿！</p>', category: 'event', cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20new%20year%20game%20event%20festival&image_size=landscape_4_3', is_top: 0 }
    ];

    const stmt = db.prepare('INSERT INTO news (title, content, category, cover_image, is_top) VALUES (?, ?, ?, ?, ?)');
    defaultNews.forEach(news => {
      stmt.run(news.title, news.content, news.category, news.cover_image, news.is_top);
    });
    console.log('默认资讯数据创建完成');
  }

  const eventsCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
  if (eventsCount.count === 0) {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const defaultEvents = [
      { title: '新手冲级大赛', description: '活动期间新手玩家达到指定等级可获得丰厚奖励！', cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=game%20level%20up%20contest%20reward%20celebration&image_size=landscape_4_3', start_time: now.toISOString(), end_time: nextWeek.toISOString(), status: 'ongoing', is_published: 1, sort_order: 1 },
      { title: '跨服公会战报名', description: '第二季跨服公会战开始报名，快来为你的公会而战！', cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=guild%20war%20battle%20game%20tournament&image_size=landscape_4_3', start_time: nextWeek.toISOString(), end_time: new Date(nextWeek.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), status: 'upcoming', is_published: 1, sort_order: 2 },
      { title: '首充双倍返利', description: '首充任意金额即可获得双倍钻石返利！', cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=game%20recharge%20bonus%20diamond%20reward&image_size=landscape_4_3', start_time: lastWeek.toISOString(), end_time: now.toISOString(), status: 'ended', is_published: 1, sort_order: 3 }
    ];

    const stmt = db.prepare('INSERT INTO events (title, description, cover_image, start_time, end_time, status, is_published, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    defaultEvents.forEach(event => {
      stmt.run(event.title, event.description, event.cover_image, event.start_time, event.end_time, event.status, event.is_published, event.sort_order);
    });
    console.log('默认活动数据创建完成');
  }

  console.log('数据库初始化完成！');
};

initDatabase();
