import db from './db';
import bcrypt from 'bcryptjs';

const initDatabase = (): void => {
  console.log('开始初始化数据库...');

  db.exec(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_en TEXT,
      content TEXT NOT NULL,
      content_en TEXT,
      category TEXT NOT NULL DEFAULT 'announcement',
      cover_image TEXT,
      is_top INTEGER DEFAULT 0,
      is_hot INTEGER DEFAULT 0,
      is_recommend INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      share_count INTEGER DEFAULT 0,
      tags TEXT,
      publish_time DATETIME,
      scheduled_publish_time DATETIME,
      scheduled_offline_time DATETIME,
      status TEXT DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_en TEXT,
      description TEXT,
      description_en TEXT,
      cover_image TEXT,
      start_time DATETIME,
      end_time DATETIME,
      status TEXT DEFAULT 'upcoming',
      is_published INTEGER DEFAULT 0,
      is_hot INTEGER DEFAULT 0,
      click_count INTEGER DEFAULT 0,
      link_url TEXT,
      scheduled_publish_time DATETIME,
      scheduled_offline_time DATETIME,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS home_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_name TEXT NOT NULL UNIQUE,
      config_data TEXT NOT NULL,
      config_data_en TEXT,
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
      category TEXT DEFAULT 'other',
      status TEXT DEFAULT 'pending',
      reply TEXT,
      replied_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      question_en TEXT,
      answer TEXT NOT NULL,
      answer_en TEXT,
      category TEXT DEFAULT 'other',
      sort_order INTEGER DEFAULT 0,
      is_enabled INTEGER DEFAULT 1,
      view_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS compliance_docs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_type TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      title_en TEXT,
      content TEXT NOT NULL,
      content_en TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      value_en TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'operator',
      permissions TEXT,
      last_login_at DATETIME,
      last_login_ip TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media_library (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      file_type TEXT,
      mime_type TEXT,
      title TEXT,
      title_en TEXT,
      description TEXT,
      description_en TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS statistics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stat_date DATE NOT NULL UNIQUE,
      pv INTEGER DEFAULT 0,
      uv INTEGER DEFAULT 0,
      downloads INTEGER DEFAULT 0,
      reservations INTEGER DEFAULT 0,
      news_views INTEGER DEFAULT 0,
      event_clicks INTEGER DEFAULT 0,
      tickets INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS operation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      action TEXT NOT NULL,
      module TEXT,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS access_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      method TEXT,
      ip_address TEXT,
      user_agent TEXT,
      referer TEXT,
      session_id TEXT,
      user_id INTEGER,
      response_time INTEGER,
      status_code INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS download_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('表结构创建完成');

  const addColumnIfNotExists = (tableName: string, columnName: string, columnDefinition: string): void => {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as { name: string }[];
    const columnExists = columns.some(col => col.name === columnName);
    if (!columnExists) {
      db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`).run();
      console.log(`已添加列: ${tableName}.${columnName}`);
    }
  };

  addColumnIfNotExists('news', 'title_en', 'TEXT');
  addColumnIfNotExists('news', 'content_en', 'TEXT');
  addColumnIfNotExists('news', 'is_top', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('news', 'is_hot', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('news', 'is_recommend', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('news', 'view_count', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('news', 'share_count', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('news', 'tags', 'TEXT');
  addColumnIfNotExists('news', 'publish_time', 'DATETIME');
  addColumnIfNotExists('news', 'scheduled_publish_time', 'DATETIME');
  addColumnIfNotExists('news', 'scheduled_offline_time', 'DATETIME');
  addColumnIfNotExists('news', 'status', "TEXT DEFAULT 'published'");

  addColumnIfNotExists('events', 'title_en', 'TEXT');
  addColumnIfNotExists('events', 'description_en', 'TEXT');
  addColumnIfNotExists('events', 'status', "TEXT DEFAULT 'upcoming'");
  addColumnIfNotExists('events', 'is_published', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('events', 'is_hot', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('events', 'click_count', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('events', 'link_url', 'TEXT');
  addColumnIfNotExists('events', 'scheduled_publish_time', 'DATETIME');
  addColumnIfNotExists('events', 'scheduled_offline_time', 'DATETIME');
  addColumnIfNotExists('events', 'sort_order', 'INTEGER DEFAULT 0');

  addColumnIfNotExists('tickets', 'user_name', 'TEXT');
  addColumnIfNotExists('tickets', 'category', "TEXT DEFAULT 'other'");
  addColumnIfNotExists('tickets', 'status', "TEXT DEFAULT 'pending'");
  addColumnIfNotExists('tickets', 'reply', 'TEXT');
  addColumnIfNotExists('tickets', 'replied_at', 'DATETIME');

  addColumnIfNotExists('faqs', 'question_en', 'TEXT');
  addColumnIfNotExists('faqs', 'answer_en', 'TEXT');
  addColumnIfNotExists('faqs', 'category', "TEXT DEFAULT 'other'");
  addColumnIfNotExists('faqs', 'sort_order', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('faqs', 'is_enabled', 'INTEGER DEFAULT 1');
  addColumnIfNotExists('faqs', 'view_count', 'INTEGER DEFAULT 0');

  addColumnIfNotExists('compliance_docs', 'title_en', 'TEXT');
  addColumnIfNotExists('compliance_docs', 'content_en', 'TEXT');

  addColumnIfNotExists('settings', 'value_en', 'TEXT');

  addColumnIfNotExists('home_config', 'config_data_en', 'TEXT');

  console.log('数据库迁移完成');

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
    CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at);
    CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
    CREATE INDEX IF NOT EXISTS idx_news_is_top ON news(is_top);
    CREATE INDEX IF NOT EXISTS idx_news_is_hot ON news(is_hot);
    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
    CREATE INDEX IF NOT EXISTS idx_events_is_published ON events(is_published);
    CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
    CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
    CREATE INDEX IF NOT EXISTS idx_statistics_date ON statistics(stat_date);
    CREATE INDEX IF NOT EXISTS idx_operation_logs_user ON operation_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_operation_logs_created ON operation_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_access_logs_path ON access_logs(path);
    CREATE INDEX IF NOT EXISTS idx_access_logs_created ON access_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_media_library_type ON media_library(file_type);
    CREATE INDEX IF NOT EXISTS idx_download_records_platform ON download_records(platform);
  `);

  console.log('索引创建完成');

  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
  if (adminCount.count === 0) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    const stmt = db.prepare('INSERT INTO admin_users (username, password_hash, role, permissions) VALUES (?, ?, ?, ?)');
    stmt.run('admin', passwordHash, 'superadmin', JSON.stringify(['*']));
    stmt.run('operator', passwordHash, 'operator', JSON.stringify([
      'news:view', 'news:create', 'news:edit',
      'events:view', 'events:create', 'events:edit',
      'home:view', 'home:edit',
      'tickets:view', 'tickets:reply',
      'reservations:view',
      'media:view', 'media:upload', 'media:delete'
    ]));
    stmt.run('viewer', passwordHash, 'viewer', JSON.stringify([
      'news:view', 'events:view', 'home:view',
      'tickets:view', 'reservations:view',
      'statistics:view'
    ]));
    console.log('默认管理员账户创建完成:');
    console.log('  - 超级管理员: admin / admin123');
    console.log('  - 运营人员: operator / admin123');
    console.log('  - 只读人员: viewer / admin123');
  }

  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (settingsCount.count === 0) {
    const defaultSettings = [
      { key: 'site_name', value: '星际幻想 - 官方网站', value_en: 'Stellar Fantasy - Official Website', description: '网站名称' },
      { key: 'site_logo', value: '', value_en: '', description: '网站Logo' },
      { key: 'icp', value: '粤ICP备XXXXXXXX号', value_en: '', description: '备案信息' },
      { key: 'copyright', value: '© 2024 星际幻想. All rights reserved.', value_en: '© 2024 Stellar Fantasy. All rights reserved.', description: '版权信息' },
      { key: 'default_language', value: 'zh-CN', value_en: 'zh-CN', description: '默认语言' },
      { key: 'enable_language_switch', value: '1', value_en: '1', description: '启用语言切换' },
      { key: 'hero_video_url', value: '', value_en: '', description: '首页Hero视频URL' },
      { key: 'cg_video_url', value: '', value_en: '', description: 'CG宣传视频URL' }
    ];
    
    const stmt = db.prepare('INSERT INTO settings (key, value, value_en, description) VALUES (?, ?, ?, ?)');
    defaultSettings.forEach(setting => {
      stmt.run(setting.key, setting.value, setting.value_en, setting.description);
    });
    console.log('默认系统设置创建完成');
  }

  const complianceCount = db.prepare('SELECT COUNT(*) as count FROM compliance_docs').get() as { count: number };
  if (complianceCount.count === 0) {
    const defaultDocs = [
      { doc_type: 'user_agreement', title: '用户协议', title_en: 'User Agreement', content: '<h1>用户协议</h1><p>欢迎使用我们的游戏服务...</p>', content_en: '<h1>User Agreement</h1><p>Welcome to our game service...</p>' },
      { doc_type: 'privacy_policy', title: '隐私政策', title_en: 'Privacy Policy', content: '<h1>隐私政策</h1><p>我们非常重视您的隐私保护...</p>', content_en: '<h1>Privacy Policy</h1><p>We take your privacy very seriously...</p>' },
      { doc_type: 'minor_protection', title: '未成年人保护政策', title_en: 'Minor Protection Policy', content: '<h1>未成年人保护政策</h1><p>为保护未成年人健康成长...</p>', content_en: '<h1>Minor Protection Policy</h1><p>To protect the healthy growth of minors...</p>' },
      { doc_type: 'copyright', title: '版权声明', title_en: 'Copyright Notice', content: '<h1>版权声明</h1><p>本游戏所有内容版权归官方所有...</p>', content_en: '<h1>Copyright Notice</h1><p>All content of this game is copyrighted by the official...</p>' }
    ];
    
    const stmt = db.prepare('INSERT INTO compliance_docs (doc_type, title, title_en, content, content_en) VALUES (?, ?, ?, ?, ?)');
    defaultDocs.forEach(doc => {
      stmt.run(doc.doc_type, doc.title, doc.title_en, doc.content, doc.content_en);
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

    const defaultBannersEn = JSON.stringify([
      { id: 1, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%20game%20banner%20futuristic%20dark%20blue%20neon&image_size=landscape_16_9', title: 'Stellar Fantasy Now Live', link: '/download' },
      { id: 2, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fantasy%20game%20world%20magic%20epic%20battle&image_size=landscape_16_9', title: 'New Version Dawn Coming', link: '/news' },
      { id: 3, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=space%20galaxy%20game%20adventure%20stars%20cosmic&image_size=landscape_16_9', title: 'Cross-Server Battle Starts', link: '/events' }
    ]);

    const defaultHighlights = JSON.stringify([
      { id: 1, icon: '🎮', title: '极致画质', description: '4K超清画面，沉浸式游戏体验' },
      { id: 2, icon: '⚔️', title: '多元战斗', description: '丰富技能组合，策略对决' },
      { id: 3, icon: '🌍', title: '开放世界', description: '超大地图自由探索' },
      { id: 4, icon: '👥', title: '社交互动', description: '组队副本，公会争霸' }
    ]);

    const defaultHighlightsEn = JSON.stringify([
      { id: 1, icon: '🎮', title: 'Ultra Graphics', description: '4K ultra-clear picture, immersive gaming experience' },
      { id: 2, icon: '⚔️', title: 'Dynamic Combat', description: 'Rich skill combinations, strategic duels' },
      { id: 3, icon: '🌍', title: 'Open World', description: 'Explore vast maps freely' },
      { id: 4, icon: '👥', title: 'Social Interaction', description: 'Team dungeons, guild wars' }
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
      { module_name: 'banners', config_data: defaultBanners, config_data_en: defaultBannersEn, sort_order: 1 },
      { module_name: 'highlights', config_data: defaultHighlights, config_data_en: defaultHighlightsEn, sort_order: 2 },
      { module_name: 'previews', config_data: defaultPreview, config_data_en: defaultPreview, sort_order: 4 },
      { module_name: 'social', config_data: defaultSocial, config_data_en: defaultSocial, sort_order: 5 }
    ];

    const stmt = db.prepare('INSERT INTO home_config (module_name, config_data, config_data_en, is_enabled, sort_order) VALUES (?, ?, ?, 1, ?)');
    homeConfigs.forEach(config => {
      stmt.run(config.module_name, config.config_data, config.config_data_en, config.sort_order);
    });
    console.log('默认首页配置创建完成');
  }

  const newsCount = db.prepare('SELECT COUNT(*) as count FROM news').get() as { count: number };
  if (newsCount.count === 0) {
    const defaultNews = [
      { title: '《星际幻想》正式公测开启！', title_en: '"Stellar Fantasy" Official Open Beta Starts!', content: '<p>亲爱的玩家们，《星际幻想》正式公测现已全面开启！</p>', content_en: '<p>Dear players, the official open beta of "Stellar Fantasy" is now fully open!</p>', category: 'announcement', cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=game%20launch%20celebration%20fantasy%20epic&image_size=landscape_4_3', is_top: 1, is_hot: 1, is_recommend: 1, status: 'published', tags: JSON.stringify(['公测', '开服', '活动']) },
      { title: '1.2版本更新公告', title_en: 'Version 1.2 Update Notice', content: '<p>本次更新新增了多个副本和优化了游戏体验...</p>', content_en: '<p>This update adds multiple dungeons and optimizes the gaming experience...</p>', category: 'version', cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=game%20update%20patch%20notes%20digital&image_size=landscape_4_3', is_top: 0, is_hot: 1, is_recommend: 0, status: 'published', tags: JSON.stringify(['更新', '版本', '优化']) },
      { title: '春节限时活动即将开启', title_en: 'Spring Festival Limited Event Coming Soon', content: '<p>春节限定活动将在下周开启，海量奖励等你来拿！</p>', content_en: '<p>The Spring Festival limited event will start next week, with massive rewards waiting for you!</p>', category: 'event', cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20new%20year%20game%20event%20festival&image_size=landscape_4_3', is_top: 0, is_hot: 0, is_recommend: 1, status: 'published', tags: JSON.stringify(['活动', '春节', '限定']) }
    ];

    const stmt = db.prepare('INSERT INTO news (title, title_en, content, content_en, category, cover_image, is_top, is_hot, is_recommend, status, tags, publish_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)');
    defaultNews.forEach(news => {
      stmt.run(news.title, news.title_en, news.content, news.content_en, news.category, news.cover_image, news.is_top, news.is_hot, news.is_recommend, news.status, news.tags);
    });
    console.log('默认资讯数据创建完成');
  }

  const eventsCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
  if (eventsCount.count === 0) {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const defaultEvents = [
      { title: '新手冲级大赛', title_en: 'New Player Level Up Contest', description: '活动期间新手玩家达到指定等级可获得丰厚奖励！', description_en: 'New players who reach the specified level during the event can receive generous rewards!', cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=game%20level%20up%20contest%20reward%20celebration&image_size=landscape_4_3', start_time: now.toISOString(), end_time: nextWeek.toISOString(), status: 'ongoing', is_published: 1, is_hot: 1, sort_order: 1 },
      { title: '跨服公会战报名', title_en: 'Cross-Server Guild War Registration', description: '第二季跨服公会战开始报名，快来为你的公会而战！', description_en: 'Registration for Season 2 Cross-Server Guild War is now open. Fight for your guild!', cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=guild%20war%20battle%20game%20tournament&image_size=landscape_4_3', start_time: nextWeek.toISOString(), end_time: new Date(nextWeek.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), status: 'upcoming', is_published: 1, is_hot: 0, sort_order: 2 },
      { title: '首充双倍返利', title_en: 'First Charge Double Rebate', description: '首充任意金额即可获得双倍钻石返利！', description_en: 'Get double diamond rebate for any first charge!', cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=game%20recharge%20bonus%20diamond%20reward&image_size=landscape_4_3', start_time: lastWeek.toISOString(), end_time: now.toISOString(), status: 'ended', is_published: 1, is_hot: 0, sort_order: 3 }
    ];

    const stmt = db.prepare('INSERT INTO events (title, title_en, description, description_en, cover_image, start_time, end_time, status, is_published, is_hot, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    defaultEvents.forEach(event => {
      stmt.run(event.title, event.title_en, event.description, event.description_en, event.cover_image, event.start_time, event.end_time, event.status, event.is_published, event.is_hot, event.sort_order);
    });
    console.log('默认活动数据创建完成');
  }

  const faqCount = db.prepare('SELECT COUNT(*) as count FROM faqs').get() as { count: number };
  if (faqCount.count === 0) {
    const defaultFaqs = [
      { question: '游戏最低配置要求是什么？', question_en: 'What are the minimum system requirements?', answer: '<p>Windows 10 64位，Intel Core i5-4460 / AMD FX-8350，8GB内存，NVIDIA GTX 960 2GB。</p>', answer_en: '<p>Windows 10 64-bit, Intel Core i5-4460 / AMD FX-8350, 8GB RAM, NVIDIA GTX 960 2GB.</p>', category: 'technical', sort_order: 1 },
      { question: '如何修改账号密码？', question_en: 'How to change account password?', answer: '<p>登录后在个人中心-账号设置中可以修改密码。</p>', answer_en: '<p>After logging in, you can change your password in Personal Center - Account Settings.</p>', category: 'account', sort_order: 2 },
      { question: '充值未到账怎么办？', question_en: 'What to do if recharge is not received?', answer: '<p>请联系客服提供订单号，我们会在24小时内处理。</p>', answer_en: '<p>Please contact customer service with your order number, we will process it within 24 hours.</p>', category: 'payment', sort_order: 3 },
      { question: '游戏经常闪退怎么办？', question_en: 'What to do if the game crashes frequently?', answer: '<p>请更新显卡驱动，验证游戏文件完整性，或降低画质设置。</p>', answer_en: '<p>Please update your graphics driver, verify game file integrity, or lower graphics settings.</p>', category: 'technical', sort_order: 4 },
      { question: '如何加入公会？', question_en: 'How to join a guild?', answer: '<p>达到20级后可以在公会界面申请加入或创建公会。</p>', answer_en: '<p>After reaching level 20, you can apply to join or create a guild in the guild interface.</p>', category: 'gameplay', sort_order: 5 }
    ];

    const stmt = db.prepare('INSERT INTO faqs (question, question_en, answer, answer_en, category, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    defaultFaqs.forEach(faq => {
      stmt.run(faq.question, faq.question_en, faq.answer, faq.answer_en, faq.category, faq.sort_order);
    });
    console.log('默认FAQ数据创建完成');
  }

  console.log('数据库初始化完成！');
};

initDatabase();
