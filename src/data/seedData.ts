import { getDB, generateId, generateOrderNumber } from './database';
import type {
  Designer,
  WorkExperience,
  PortfolioCategory,
  Portfolio,
  CaseStudy,
  ServicePackage,
  Order,
  QuickReply,
  Review,
  MaterialCategory,
  Material,
  User,
  ChatSession,
  ChatMessage
} from '../types';

// 示例图片URL（使用占位图服务）
const placeholderImages = [
  'https://picsum.photos/seed/design1/800/600',
  'https://picsum.photos/seed/design2/800/600',
  'https://picsum.photos/seed/design3/800/600',
  'https://picsum.photos/seed/design4/800/600',
  'https://picsum.photos/seed/design5/800/600',
  'https://picsum.photos/seed/design6/800/600',
];

const placeholderAvatars = [
  'https://i.pravatar.cc/300?img=1',
  'https://i.pravatar.cc/300?img=2',
  'https://i.pravatar.cc/300?img=3',
];

// 生成设计师数据
export function generateDesignerData(): Designer {
  return {
    id: generateId(),
    name: '张设计师',
    avatar: placeholderAvatars[0],
    title: '资深UI/UX设计师',
    bio: '拥有8年设计经验，专注于用户体验设计和品牌视觉设计。曾服务于多家知名企业，擅长将复杂的产品需求转化为优雅的用户界面。',
    location: '北京市',
    email: 'designer@example.com',
    phone: '13800138000',
    experience: 8,
    skills: ['UI设计', 'UX设计', '品牌设计', '交互设计', '视觉设计', '原型设计', '用户研究', '设计系统'],
    styles: ['简约现代', '科技感', '国风', '商务风格', '艺术创意'],
    socialLinks: [
      { platform: 'Dribbble', url: 'https://dribbble.com/designer' },
      { platform: 'Behance', url: 'https://behance.net/designer' },
      { platform: '站酷', url: 'https://zcool.com.cn/designer' },
      { platform: '小红书', url: 'https://xiaohongshu.com/designer' },
    ],
    createdAt: Date.now() - 86400000 * 365,
    updatedAt: Date.now() - 86400000 * 7,
  };
}

// 生成从业履历数据
export function generateWorkExperienceData(designerId: string): WorkExperience[] {
  return [
    {
      id: generateId(),
      designerId,
      company: '某知名互联网公司',
      position: '高级UI设计师',
      startDate: Date.now() - 86400000 * 365 * 3,
      endDate: null,
      description: '负责公司核心产品的UI设计工作，参与产品从0到1的设计过程，制定设计规范和组件库。',
      achievements: [
        '主导完成3个大型产品的UI重构，用户满意度提升30%',
        '建立设计系统，提高团队设计效率50%',
        '获得公司年度最佳设计师称号'
      ],
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now() - 86400000 * 7,
    },
    {
      id: generateId(),
      designerId,
      company: '某设计工作室',
      position: 'UI/UX设计师',
      startDate: Date.now() - 86400000 * 365 * 6,
      endDate: Date.now() - 86400000 * 365 * 3,
      description: '为多个客户提供UI/UX设计服务，涵盖电商、社交、工具类等多种产品类型。',
      achievements: [
        '完成20+客户项目设计，客户满意度100%',
        '设计作品获得站酷首页推荐3次',
        '参与多个获奖项目的设计工作'
      ],
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now() - 86400000 * 7,
    },
  ];
}

// 生成作品分类数据
export function generatePortfolioCategories(): PortfolioCategory[] {
  const categories = [
    { name: 'UI设计', description: '移动端和桌面端应用界面设计' },
    { name: '品牌设计', description: '企业品牌视觉识别系统设计' },
    { name: '插画设计', description: '商业插画和创意插画作品' },
    { name: '网页设计', description: '企业官网和活动页面设计' },
    { name: '动效设计', description: '交互动效和动画效果设计' },
  ];

  return categories.map((cat, index) => ({
    id: generateId(),
    name: cat.name,
    description: cat.description,
    sortOrder: index,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 7,
  }));
}

// 生成作品数据
export function generatePortfolios(categories: PortfolioCategory[]): Portfolio[] {
  const portfolios: Portfolio[] = [];
  const portfolioTitles = [
    '金融APP界面设计',
    '社交应用UI设计',
    '电商平台视觉设计',
    '企业官网设计',
    '品牌视觉系统',
    '健康管理APP',
    '教育平台界面',
    '智能家居控制',
    '旅行预订应用',
    '音乐播放器界面',
  ];

  const concepts = [
    '以用户为中心的设计理念，强调简洁直观的操作体验。通过精心设计的视觉层次和交互反馈，让用户能够快速上手并享受使用过程。',
    '现代简约风格，注重内容的可读性和信息的高效传达。采用大留白和清晰的视觉层次，创造出舒适的阅读体验。',
    '国风元素与现代设计的完美融合，展现独特的东方美学。通过对传统元素的现代化演绎，创造出既有文化底蕴又符合当代审美的设计作品。',
  ];

  categories.forEach((category, catIndex) => {
    for (let i = 0; i < 2; i++) {
      const titleIndex = catIndex * 2 + i;
      if (titleIndex >= portfolioTitles.length) break;

      portfolios.push({
        id: generateId(),
        categoryId: category.id,
        title: portfolioTitles[titleIndex],
        description: `这是一个关于${category.name}的优秀设计作品，展现了精湛的设计技巧和独特的设计理念。`,
        concept: concepts[titleIndex % concepts.length],
        parameters: [
          { key: '设计工具', value: 'Figma, Sketch' },
          { key: '配色方案', value: '主色调+辅助色' },
          { key: '设计周期', value: '2周' },
          { key: '项目类型', value: category.name },
        ],
        images: [
          placeholderImages[titleIndex % placeholderImages.length],
          placeholderImages[(titleIndex + 1) % placeholderImages.length],
        ],
        detailImages: [
          placeholderImages[(titleIndex + 2) % placeholderImages.length],
        ],
        videos: [],
        tags: [category.name, '精选', '原创'],
        isPublished: true,
        isTop: titleIndex < 3,
        sortOrder: titleIndex,
        viewCount: Math.floor(Math.random() * 10000) + 1000,
        likeCount: Math.floor(Math.random() * 500) + 50,
        createdAt: Date.now() - 86400000 * (30 - titleIndex),
        updatedAt: Date.now() - 86400000 * 7,
      });
    }
  });

  return portfolios;
}

// 生成案例项目数据
export function generateCaseStudies(): CaseStudy[] {
  const cases = [
    {
      title: '某电商平台全面改版项目',
      description: '为国内知名电商平台进行全面的UI/UX改版，提升用户体验和转化率。',
      client: '某电商集团',
      projectType: 'UI/UX改版',
    },
    {
      title: '金融科技APP设计项目',
      description: '从零开始设计一款金融科技应用，注重安全性和易用性的平衡。',
      client: '某金融科技公司',
      projectType: '产品设计',
    },
    {
      title: '企业品牌视觉升级项目',
      description: '为传统企业进行品牌视觉升级，打造现代化的企业形象。',
      client: '某制造业集团',
      projectType: '品牌设计',
    },
  ];

  return cases.map((c, index) => ({
    id: generateId(),
    title: c.title,
    description: c.description,
    client: c.client,
    projectType: c.projectType,
    startDate: Date.now() - 86400000 * (90 + index * 30),
    endDate: Date.now() - 86400000 * (30 + index * 10),
    processSteps: [
      {
        step: 1,
        title: '需求调研与分析',
        description: '深入了解客户需求，进行用户研究和竞品分析，明确设计目标和方向。',
        images: [placeholderImages[index]],
      },
      {
        step: 2,
        title: '概念设计与方案',
        description: '基于调研结果，提出多个设计概念方案，与客户沟通确定最终方向。',
        images: [placeholderImages[(index + 1) % placeholderImages.length]],
      },
      {
        step: 3,
        title: '详细设计与原型',
        description: '进行详细的界面设计，制作高保真原型，进行用户测试和迭代优化。',
        images: [placeholderImages[(index + 2) % placeholderImages.length]],
      },
      {
        step: 4,
        title: '设计交付与落地',
        description: '完成设计规范和切图交付，配合开发团队进行设计落地和验收。',
        images: [placeholderImages[(index + 3) % placeholderImages.length]],
      },
    ],
    beforeAfter: [
      {
        beforeImages: [placeholderImages[index]],
        afterImages: [placeholderImages[(index + 1) % placeholderImages.length]],
        description: '改版前后对比，视觉效果和用户体验得到显著提升。',
      },
    ],
    tags: [c.projectType, '成功案例', index === 0 ? '热门' : '精选'],
    isFeatured: index === 0,
    sortOrder: index,
    viewCount: Math.floor(Math.random() * 5000) + 500,
    createdAt: Date.now() - 86400000 * (60 - index * 20),
    updatedAt: Date.now() - 86400000 * 7,
  }));
}

// 生成服务套餐数据
export function generateServicePackages(): ServicePackage[] {
  return [
    {
      id: generateId(),
      name: '基础设计套餐',
      description: '适合小型项目或初创企业，提供基础的设计服务。',
      price: 2999,
      currency: 'CNY',
      features: [
        '1个页面设计',
        '2次修改机会',
        '基础设计规范',
        '源文件交付',
        '7天内交付',
      ],
      deliveryDays: 7,
      revisionLimit: 2,
      isActive: true,
      sortOrder: 1,
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now() - 86400000 * 7,
    },
    {
      id: generateId(),
      name: '专业设计套餐',
      description: '适合中型项目，提供完整的设计服务和更多修改机会。',
      price: 5999,
      currency: 'CNY',
      features: [
        '5个页面设计',
        '5次修改机会',
        '完整设计规范',
        '原型图设计',
        '源文件交付',
        '14天内交付',
        '优先技术支持',
      ],
      deliveryDays: 14,
      revisionLimit: 5,
      isActive: true,
      sortOrder: 2,
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now() - 86400000 * 7,
    },
    {
      id: generateId(),
      name: '企业定制套餐',
      description: '适合大型企业项目，提供全方位的设计服务和专属顾问。',
      price: 12999,
      currency: 'CNY',
      features: [
        '无限页面设计',
        '无限修改机会',
        '完整设计系统',
        '用户研究测试',
        '原型交互设计',
        '专属设计顾问',
        '源文件交付',
        '30天内交付',
        '1年技术支持',
      ],
      deliveryDays: 30,
      revisionLimit: 99,
      isActive: true,
      sortOrder: 3,
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now() - 86400000 * 7,
    },
  ];
}

// 生成订单数据
export function generateOrders(packages: ServicePackage[]): Order[] {
  const statuses: Order['status'][] = ['pending', 'confirmed', 'in_progress', 'completed', 'completed'];
  const paymentStatuses: Order['paymentStatus'][] = ['pending', 'paid', 'paid', 'paid', 'paid'];

  return packages.map((pkg, index) => ({
    id: generateId(),
    orderNumber: generateOrderNumber(),
    clientName: `客户${index + 1}`,
    clientEmail: `client${index + 1}@example.com`,
    clientPhone: `1380013800${index}`,
    packageId: pkg.id,
    packageName: pkg.name,
    packagePrice: pkg.price,
    quantity: 1,
    totalAmount: pkg.price,
    status: statuses[index % statuses.length],
    paymentStatus: paymentStatuses[index % paymentStatuses.length],
    description: '客户需要进行产品界面设计，希望能够体现品牌特色。',
    requirements: '1. 风格要现代简约\n2. 配色要体现品牌特色\n3. 需要适配移动端和桌面端',
    files: [],
    revisionsUsed: index * 2,
    scheduledDate: Date.now() + 86400000 * (index + 1) * 7,
    completedDate: statuses[index] === 'completed' ? Date.now() - 86400000 * index : null,
    createdAt: Date.now() - 86400000 * (30 - index * 5),
    updatedAt: Date.now() - 86400000 * (index + 1),
  }));
}

// 生成快捷回复数据
export function generateQuickReplies(): QuickReply[] {
  const replies = [
    { title: '问候语', content: '您好！感谢您的咨询。我是张设计师，很高兴为您服务。请问有什么可以帮助您的吗？', category: '问候' },
    { title: '价格说明', content: '我们的设计服务有不同的套餐：基础套餐2999元起，专业套餐5999元，企业定制套餐12999元。具体价格会根据您的需求进行调整。', category: '价格咨询' },
    { title: '项目流程', content: '我们的设计流程是：需求沟通 -> 方案报价 -> 签订合同 -> 支付定金 -> 设计执行 -> 方案确认 -> 交付源文件 -> 售后支持。', category: '项目咨询' },
    { title: '订单跟进', content: '您好，您的订单我们正在处理中，设计师会尽快与您联系沟通具体需求。如有任何问题，请随时联系我们。', category: '订单跟进' },
    { title: '售后问题', content: '非常抱歉给您带来不便。请您详细描述一下问题，我们会尽快安排设计师为您处理。', category: '售后问题' },
  ];

  return replies.map((r, index) => ({
    id: generateId(),
    title: r.title,
    content: r.content,
    category: r.category,
    sortOrder: index,
    isActive: true,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 7,
  }));
}

// 生成评价数据
export function generateReviews(orders: Order[]): Review[] {
  const reviewContents = [
    '设计师非常专业，沟通顺畅，交付的设计作品质量很高。对我们提出的修改意见都能够很好地理解和执行，强烈推荐！',
    '整个合作过程非常愉快，设计师理解需求很快，设计方案超出预期。交付也很及时，下次有项目还会继续合作。',
    '专业、高效、负责！从需求沟通到最终交付，每一个环节都做得很好。设计作品既有创意又实用，非常满意！',
  ];

  return orders.slice(0, 3).map((order, index) => ({
    id: generateId(),
    orderId: order.id,
    clientName: order.clientName,
    clientAvatar: placeholderAvatars[(index + 1) % placeholderAvatars.length],
    rating: 5 - index,
    title: index === 0 ? '非常满意的一次合作' : index === 1 ? '专业高效的设计服务' : '超出预期的设计质量',
    content: reviewContents[index],
    images: index === 0 ? [placeholderImages[index]] : [],
    isPinned: index === 0,
    isFeatured: index < 2,
    reply: index === 0 ? '感谢您的好评！很高兴能够为您提供满意的设计服务。期待下次继续合作！' : null,
    replyAt: index === 0 ? Date.now() - 86400000 * 2 : null,
    createdAt: Date.now() - 86400000 * (15 - index * 5),
    updatedAt: Date.now() - 86400000 * (index + 1),
  }));
}

// 生成素材分类数据
export function generateMaterialCategories(): MaterialCategory[] {
  const categories = [
    { name: 'UI模板', description: '移动端和桌面端UI设计模板' },
    { name: '图标素材', description: '各类图标和图标集' },
    { name: '插画素材', description: '商业插画和矢量插画' },
    { name: '字体资源', description: '精选字体和字体包' },
    { name: '配色方案', description: '设计配色方案和色板' },
  ];

  return categories.map((cat, index) => ({
    id: generateId(),
    name: cat.name,
    description: cat.description,
    sortOrder: index,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 7,
  }));
}

// 生成素材数据
export function generateMaterials(categories: MaterialCategory[]): Material[] {
  const materials: Material[] = [];
  const materialTitles = [
    '电商APP UI模板',
    '社交应用界面模板',
    '线性图标集',
    '扁平化图标包',
    '商业插画合集',
    '节日主题插画',
    '无衬线字体包',
    '手写风格字体',
    '渐变配色方案',
    '莫兰迪色系',
  ];

  const fileTypes: Material['fileType'][] = ['template', 'template', 'image', 'image', 'vector', 'vector', 'font', 'font', 'other', 'other'];

  categories.forEach((category, catIndex) => {
    for (let i = 0; i < 2; i++) {
      const titleIndex = catIndex * 2 + i;
      if (titleIndex >= materialTitles.length) break;

      materials.push({
        id: generateId(),
        categoryId: category.id,
        title: materialTitles[titleIndex],
        description: `高质量的${category.name}资源，适合各类设计项目使用。`,
        thumbnail: placeholderImages[titleIndex % placeholderImages.length],
        fileUrl: `https://example.com/materials/${titleIndex}`,
        fileType: fileTypes[titleIndex],
        fileSize: Math.floor(Math.random() * 50000) + 1000,
        price: titleIndex % 3 === 0 ? 0 : Math.floor(Math.random() * 100) + 10,
        tags: [category.name, '精选', '优质'],
        downloadCount: Math.floor(Math.random() * 10000) + 100,
        likeCount: Math.floor(Math.random() * 500) + 20,
        isActive: true,
        createdAt: Date.now() - 86400000 * (30 - titleIndex),
        updatedAt: Date.now() - 86400000 * 7,
      });
    }
  });

  return materials;
}

// 生成用户数据
export function generateUsers(): User[] {
  return [
    {
      id: generateId(),
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: 'hashed_password_123', // 实际项目中应该使用bcrypt等加密
      role: 'admin',
      permissions: [
        'portfolio:read', 'portfolio:write', 'portfolio:delete',
        'case_study:read', 'case_study:write', 'case_study:delete',
        'order:read', 'order:write', 'order:delete',
        'chat:read', 'chat:write',
        'review:read', 'review:write',
        'material:read', 'material:write', 'material:delete',
        'analytics:read',
        'user:read', 'user:write', 'user:delete',
        'sub_user:read', 'sub_user:write', 'sub_user:delete',
        'settings:read', 'settings:write',
      ],
      isActive: true,
      lastLoginAt: Date.now() - 86400000,
      createdAt: Date.now() - 86400000 * 365,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: generateId(),
      username: 'designer',
      email: 'designer@example.com',
      passwordHash: 'hashed_password_456',
      role: 'designer',
      permissions: [
        'portfolio:read', 'portfolio:write',
        'case_study:read', 'case_study:write',
        'order:read', 'order:write',
        'chat:read', 'chat:write',
        'review:read', 'review:write',
        'material:read', 'material:write',
        'analytics:read',
        'settings:read',
      ],
      isActive: true,
      lastLoginAt: Date.now() - 86400000 * 2,
      createdAt: Date.now() - 86400000 * 180,
      updatedAt: Date.now() - 86400000 * 2,
    },
  ];
}

// 生成聊天会话和消息数据
export function generateChatData(): { sessions: ChatSession[]; messages: ChatMessage[] } {
  const sessions: ChatSession[] = [
    {
      id: generateId(),
      participantName: '李小明',
      participantEmail: 'lixiaoming@example.com',
      lastMessage: '好的，我会尽快整理需求发给您。',
      lastMessageTime: Date.now() - 3600000 * 2,
      unreadCount: 1,
      isActive: true,
      createdAt: Date.now() - 86400000 * 5,
      updatedAt: Date.now() - 3600000 * 2,
    },
    {
      id: generateId(),
      participantName: '王小红',
      participantEmail: 'wangxiaohong@example.com',
      lastMessage: '请问基础套餐包含哪些服务？',
      lastMessageTime: Date.now() - 86400000 * 1,
      unreadCount: 2,
      isActive: true,
      createdAt: Date.now() - 86400000 * 10,
      updatedAt: Date.now() - 86400000 * 1,
    },
  ];

  const messages: ChatMessage[] = [];
  sessions.forEach((session, sIndex) => {
    const msgCount = 3 + sIndex * 2;
    for (let i = 0; i < msgCount; i++) {
      messages.push({
        id: generateId(),
        sessionId: session.id,
        sender: i % 2 === 0 ? 'user' : 'designer',
        content: i === 0 
          ? '您好，我想咨询一下设计服务。' 
          : i === 1 
          ? '您好！感谢您的咨询。请问您有什么具体的需求吗？'
          : i === msgCount - 1
          ? session.lastMessage
          : `这是第${i + 1}条消息内容，模拟聊天对话。`,
        messageType: 'text',
        isRead: i < msgCount - session.unreadCount,
        readAt: i < msgCount - session.unreadCount ? Date.now() - 3600000 * i : null,
        createdAt: Date.now() - 3600000 * (msgCount - i),
      });
    }
  });

  return { sessions, messages };
}

// 初始化所有示例数据
export async function initializeSeedData(): Promise<void> {
  const db = await getDB();

  // 检查是否已有数据
  const existingDesigners = await db.getAll('designers');
  if (existingDesigners.length > 0) {
    console.log('Data already exists, skipping initialization');
    return;
  }

  const tx = db.transaction([
    'designers', 'workExperiences', 'portfolioCategories', 'portfolios',
    'caseStudies', 'servicePackages', 'orders', 'quickReplies', 'reviews',
    'materialCategories', 'materials', 'users', 'chatSessions', 'chatMessages'
  ], 'readwrite');

  // 生成设计师数据
  const designer = generateDesignerData();
  await tx.objectStore('designers').put(designer);

  // 生成从业履历
  const experiences = generateWorkExperienceData(designer.id);
  for (const exp of experiences) {
    await tx.objectStore('workExperiences').put(exp);
  }

  // 生成作品分类和作品
  const portfolioCategories = generatePortfolioCategories();
  for (const cat of portfolioCategories) {
    await tx.objectStore('portfolioCategories').put(cat);
  }

  const portfolios = generatePortfolios(portfolioCategories);
  for (const p of portfolios) {
    await tx.objectStore('portfolios').put(p);
  }

  // 生成案例项目
  const caseStudies = generateCaseStudies();
  for (const cs of caseStudies) {
    await tx.objectStore('caseStudies').put(cs);
  }

  // 生成服务套餐
  const packages = generateServicePackages();
  for (const pkg of packages) {
    await tx.objectStore('servicePackages').put(pkg);
  }

  // 生成订单
  const orders = generateOrders(packages);
  for (const order of orders) {
    await tx.objectStore('orders').put(order);
  }

  // 生成快捷回复
  const quickReplies = generateQuickReplies();
  for (const qr of quickReplies) {
    await tx.objectStore('quickReplies').put(qr);
  }

  // 生成评价
  const reviews = generateReviews(orders);
  for (const review of reviews) {
    await tx.objectStore('reviews').put(review);
  }

  // 生成素材分类和素材
  const materialCategories = generateMaterialCategories();
  for (const cat of materialCategories) {
    await tx.objectStore('materialCategories').put(cat);
  }

  const materials = generateMaterials(materialCategories);
  for (const m of materials) {
    await tx.objectStore('materials').put(m);
  }

  // 生成用户
  const users = generateUsers();
  for (const user of users) {
    await tx.objectStore('users').put(user);
  }

  // 生成聊天数据
  const { sessions, messages } = generateChatData();
  for (const session of sessions) {
    await tx.objectStore('chatSessions').put(session);
  }
  for (const msg of messages) {
    await tx.objectStore('chatMessages').put(msg);
  }

  await tx.done;
  console.log('Seed data initialized successfully!');
}
