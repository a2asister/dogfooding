import { getDB, generateId } from './database';
import type {
  Designer,
  WorkExperience,
  PortfolioCategory,
  Portfolio,
  CaseStudy,
  ServicePackage,
  Order,
  OrderHistory,
  ChatSession,
  ChatMessage,
  QuickReply,
  Review,
  MaterialCategory,
  Material,
  UserFavorite,
  Analytics,
  User,
  OperationLog,
  LoginRecord
} from '../types';

// ==================== 设计师相关服务 ====================

export async function getDesigner(): Promise<Designer | undefined> {
  const db = await getDB();
  const designers = await db.getAll('designers');
  return designers[0];
}

export async function updateDesigner(designer: Designer): Promise<void> {
  const db = await getDB();
  await db.put('designers', {
    ...designer,
    updatedAt: Date.now()
  });
}

export async function getWorkExperiences(designerId: string): Promise<WorkExperience[]> {
  const db = await getDB();
  return db.getAllFromIndex('workExperiences', 'by-designer', designerId);
}

export async function addWorkExperience(experience: Omit<WorkExperience, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  await db.put('workExperiences', {
    ...experience,
    id,
    createdAt: now,
    updatedAt: now
  });
  return id;
}

export async function updateWorkExperience(experience: WorkExperience): Promise<void> {
  const db = await getDB();
  await db.put('workExperiences', {
    ...experience,
    updatedAt: Date.now()
  });
}

export async function deleteWorkExperience(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('workExperiences', id);
}

// ==================== 作品相关服务 ====================

export async function getPortfolioCategories(): Promise<PortfolioCategory[]> {
  const db = await getDB();
  return db.getAllFromIndex('portfolioCategories', 'by-sort-order');
}

export async function addPortfolioCategory(category: Omit<PortfolioCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  await db.put('portfolioCategories', {
    ...category,
    id,
    createdAt: now,
    updatedAt: now
  });
  return id;
}

export async function updatePortfolioCategory(category: PortfolioCategory): Promise<void> {
  const db = await getDB();
  await db.put('portfolioCategories', {
    ...category,
    updatedAt: Date.now()
  });
}

export async function deletePortfolioCategory(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('portfolioCategories', id);
}

export async function getPortfolios(options?: {
  categoryId?: string;
  isPublished?: boolean;
  isTop?: boolean;
  limit?: number;
  sortBy?: 'views' | 'date' | 'order';
}): Promise<Portfolio[]> {
  const db = await getDB();
  let portfolios = await db.getAll('portfolios');

  if (options?.categoryId) {
    portfolios = portfolios.filter(p => p.categoryId === options.categoryId);
  }

  if (options?.isTop !== undefined) {
    portfolios = portfolios.filter(p => p.isTop === options.isTop);
  }

  if (options?.isPublished !== undefined) {
    portfolios = portfolios.filter(p => p.isPublished === options.isPublished);
  }

  if (options?.sortBy === 'date') {
    portfolios.sort((a, b) => b.createdAt - a.createdAt);
  } else if (options?.sortBy === 'views') {
    portfolios.sort((a, b) => b.viewCount - a.viewCount);
  } else {
    portfolios.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  if (options?.limit) {
    portfolios = portfolios.slice(0, options.limit);
  }

  return portfolios;
}

export async function getPortfolioById(id: string): Promise<Portfolio | undefined> {
  const db = await getDB();
  return db.get('portfolios', id);
}

export async function addPortfolio(portfolio: Omit<Portfolio, 'id' | 'viewCount' | 'likeCount' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  await db.put('portfolios', {
    ...portfolio,
    id,
    viewCount: 0,
    likeCount: 0,
    createdAt: now,
    updatedAt: now
  });
  return id;
}

export async function updatePortfolio(portfolio: Portfolio): Promise<void> {
  const db = await getDB();
  await db.put('portfolios', {
    ...portfolio,
    updatedAt: Date.now()
  });
}

export async function incrementPortfolioView(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('portfolios', 'readwrite');
  const portfolio = await tx.store.get(id);
  if (portfolio) {
    portfolio.viewCount += 1;
    await tx.store.put(portfolio);
  }
  await tx.done;
}

export async function deletePortfolio(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('portfolios', id);
}

// ==================== 案例项目相关服务 ====================

export async function getCaseStudies(options?: {
  isFeatured?: boolean;
  tags?: string[];
  limit?: number;
}): Promise<CaseStudy[]> {
  const db = await getDB();
  let caseStudies = await db.getAll('caseStudies');

  if (options?.isFeatured !== undefined) {
    caseStudies = caseStudies.filter(cs => cs.isFeatured === options.isFeatured);
  }

  if (options?.tags && options.tags.length > 0) {
    caseStudies = caseStudies.filter(cs =>
      cs.tags.some(tag => options.tags!.includes(tag))
    );
  }

  caseStudies.sort((a, b) => b.createdAt - a.createdAt);

  if (options?.limit) {
    caseStudies = caseStudies.slice(0, options.limit);
  }

  return caseStudies;
}

export async function getCaseStudyById(id: string): Promise<CaseStudy | undefined> {
  const db = await getDB();
  return db.get('caseStudies', id);
}

export async function addCaseStudy(caseStudy: Omit<CaseStudy, 'id' | 'viewCount' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  await db.put('caseStudies', {
    ...caseStudy,
    id,
    viewCount: 0,
    createdAt: now,
    updatedAt: now
  });
  return id;
}

export async function updateCaseStudy(caseStudy: CaseStudy): Promise<void> {
  const db = await getDB();
  await db.put('caseStudies', {
    ...caseStudy,
    updatedAt: Date.now()
  });
}

export async function deleteCaseStudy(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('caseStudies', id);
}

// ==================== 服务套餐相关服务 ====================

export async function getServicePackages(isActive?: boolean): Promise<ServicePackage[]> {
  const db = await getDB();
  let packages = await db.getAll('servicePackages');

  if (isActive !== undefined) {
    packages = packages.filter(p => p.isActive === isActive);
  }

  packages.sort((a, b) => a.sortOrder - b.sortOrder);
  return packages;
}

export async function getServicePackageById(id: string): Promise<ServicePackage | undefined> {
  const db = await getDB();
  return db.get('servicePackages', id);
}

export async function addServicePackage(pkg: Omit<ServicePackage, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  await db.put('servicePackages', {
    ...pkg,
    id,
    createdAt: now,
    updatedAt: now
  });
  return id;
}

export async function updateServicePackage(pkg: ServicePackage): Promise<void> {
  const db = await getDB();
  await db.put('servicePackages', {
    ...pkg,
    updatedAt: Date.now()
  });
}

export async function deleteServicePackage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('servicePackages', id);
}

// ==================== 订单相关服务 ====================

export async function getOrders(options?: {
  status?: Order['status'];
  paymentStatus?: Order['paymentStatus'];
  clientEmail?: string;
  limit?: number;
}): Promise<Order[]> {
  const db = await getDB();
  let orders: Order[];

  if (options?.status) {
    orders = await db.getAllFromIndex('orders', 'by-status', options.status);
  } else if (options?.paymentStatus) {
    orders = await db.getAllFromIndex('orders', 'by-payment-status', options.paymentStatus);
  } else if (options?.clientEmail) {
    orders = await db.getAllFromIndex('orders', 'by-client-email', options.clientEmail);
  } else {
    orders = await db.getAll('orders');
  }

  // 按创建时间降序排序
  orders.sort((a, b) => b.createdAt - a.createdAt);

  // 限制数量
  if (options?.limit) {
    orders = orders.slice(0, options.limit);
  }

  return orders;
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const db = await getDB();
  return db.get('orders', id);
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
  const db = await getDB();
  return db.getFromIndex('orders', 'by-order-number', orderNumber);
}

export async function addOrder(order: Omit<Order, 'id' | 'revisionsUsed' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  await db.put('orders', {
    ...order,
    id,
    revisionsUsed: 0,
    createdAt: now,
    updatedAt: now
  });

  // 添加订单历史记录
  await addOrderHistory({
    orderId: id,
    status: order.status,
    description: '订单已创建',
    createdBy: 'system',
  });

  return id;
}

export async function updateOrder(order: Order, statusChange?: {
  newStatus: Order['status'];
  description: string;
  createdBy: string;
}): Promise<void> {
  const db = await getDB();
  const now = Date.now();

  await db.put('orders', {
    ...order,
    updatedAt: now
  });

  // 如果有状态变更，添加历史记录
  if (statusChange) {
    await addOrderHistory({
      orderId: order.id,
      status: statusChange.newStatus,
      description: statusChange.description,
      createdBy: statusChange.createdBy,
    });
  }
}

export async function addOrderHistory(history: Omit<OrderHistory, 'id' | 'createdAt'>): Promise<string> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  await db.put('orderHistories', {
    ...history,
    id,
    createdAt: now
  });
  return id;
}

export async function getOrderHistories(orderId: string): Promise<OrderHistory[]> {
  const db = await getDB();
  const histories = await db.getAllFromIndex('orderHistories', 'by-order', orderId);
  return histories.sort((a, b) => a.createdAt - b.createdAt);
}

// ==================== 聊天相关服务 ====================

export async function getChatSessions(options?: {
  isActive?: boolean;
  limit?: number;
}): Promise<ChatSession[]> {
  const db = await getDB();
  let sessions: ChatSession[];

  if (options?.isActive !== undefined) {
    sessions = await db.getAllFromIndex('chatSessions', 'by-active', options.isActive);
  } else {
    sessions = await db.getAll('chatSessions');
  }

  // 按最后消息时间降序排序
  sessions.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

  // 限制数量
  if (options?.limit) {
    sessions = sessions.slice(0, options.limit);
  }

  return sessions;
}

export async function getChatSessionById(id: string): Promise<ChatSession | undefined> {
  const db = await getDB();
  return db.get('chatSessions', id);
}

export async function addChatSession(session: Omit<ChatSession, 'id' | 'unreadCount' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  await db.put('chatSessions', {
    ...session,
    id,
    unreadCount: 0,
    createdAt: now,
    updatedAt: now
  });
  return id;
}

export async function updateChatSession(session: ChatSession): Promise<void> {
  const db = await getDB();
  await db.put('chatSessions', {
    ...session,
    updatedAt: Date.now()
  });
}

export async function getChatMessages(sessionId: string, limit?: number): Promise<ChatMessage[]> {
  const db = await getDB();
  let messages = await db.getAll('chatMessages');

  messages = messages.filter(m => m.sessionId === sessionId);
  messages.sort((a, b) => a.createdAt - b.createdAt);

  if (limit) {
    messages = messages.slice(-limit);
  }

  return messages;
}

export async function addChatMessage(message: Omit<ChatMessage, 'id' | 'isRead' | 'readAt' | 'createdAt'>): Promise<string> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  const chatMessage: ChatMessage = {
    ...message,
    id,
    isRead: message.sender === 'designer',
    readAt: message.sender === 'designer' ? now : null,
    createdAt: now
  };

  await db.put('chatMessages', chatMessage);

  // 更新会话信息
  const session = await db.get('chatSessions', message.sessionId);
  if (session) {
    session.lastMessage = message.content;
    session.lastMessageTime = now;
    if (message.sender === 'user') {
      session.unreadCount += 1;
    }
    session.updatedAt = now;
    await db.put('chatSessions', session);
  }

  return id;
}

export async function markMessagesAsRead(sessionId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['chatSessions', 'chatMessages'], 'readwrite');
  const now = Date.now();

  const allMessages = await tx.objectStore('chatMessages').getAll();
  const messages = allMessages.filter(m => m.sessionId === sessionId && !m.isRead);

  for (const msg of messages) {
    msg.isRead = true;
    msg.readAt = now;
    await tx.objectStore('chatMessages').put(msg);
  }

  const session = await tx.objectStore('chatSessions').get(sessionId);
  if (session) {
    session.unreadCount = 0;
    await tx.objectStore('chatSessions').put(session);
  }

  await tx.done;
}

export async function getUnreadMessageCount(): Promise<number> {
  const db = await getDB();
  const sessions = await db.getAll('chatSessions');
  return sessions.reduce((total, session) => total + session.unreadCount, 0);
}

// ==================== 快捷回复相关服务 ====================

export async function getQuickReplies(category?: string): Promise<QuickReply[]> {
  const db = await getDB();
  let replies: QuickReply[];

  if (category) {
    replies = await db.getAllFromIndex('quickReplies', 'by-category', category);
  } else {
    replies = await db.getAll('quickReplies');
  }

  // 按排序顺序排列
  replies.sort((a, b) => a.sortOrder - b.sortOrder);
  return replies;
}

export async function addQuickReply(reply: Omit<QuickReply, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  await db.put('quickReplies', {
    ...reply,
    id,
    createdAt: now,
    updatedAt: now
  });
  return id;
}

export async function updateQuickReply(reply: QuickReply): Promise<void> {
  const db = await getDB();
  await db.put('quickReplies', {
    ...reply,
    updatedAt: Date.now()
  });
}

export async function deleteQuickReply(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('quickReplies', id);
}

// ==================== 评价相关服务 ====================

export async function getReviews(options?: {
  rating?: number;
  isPinned?: boolean;
  isFeatured?: boolean;
  limit?: number;
}): Promise<Review[]> {
  const db = await getDB();
  let reviews = await db.getAll('reviews');

  if (options?.isPinned !== undefined) {
    reviews = reviews.filter(r => r.isPinned === options.isPinned);
  } else if (options?.isFeatured !== undefined) {
    reviews = reviews.filter(r => r.isFeatured === options.isFeatured);
  } else if (options?.rating) {
    reviews = reviews.filter(r => r.rating === options.rating);
  }

  reviews.sort((a, b) => b.createdAt - a.createdAt);

  if (options?.limit) {
    reviews = reviews.slice(0, options.limit);
  }

  return reviews;
}

export async function addReview(review: Omit<Review, 'id' | 'reply' | 'replyAt' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  await db.put('reviews', {
    ...review,
    id,
    reply: null,
    replyAt: null,
    createdAt: now,
    updatedAt: now
  });
  return id;
}

export async function updateReview(review: Review): Promise<void> {
  const db = await getDB();
  await db.put('reviews', {
    ...review,
    updatedAt: Date.now()
  });
}

export async function addReviewReply(reviewId: string, reply: string): Promise<void> {
  const db = await getDB();
  const now = Date.now();
  const review = await db.get('reviews', reviewId);
  if (review) {
    review.reply = reply;
    review.replyAt = now;
    review.updatedAt = now;
    await db.put('reviews', review);
  }
}

// ==================== 素材相关服务 ====================

export async function getMaterialCategories(): Promise<MaterialCategory[]> {
  const db = await getDB();
  const categories = await db.getAllFromIndex('materialCategories', 'by-sort-order');
  return categories;
}

export async function addMaterialCategory(category: Omit<MaterialCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  await db.put('materialCategories', {
    ...category,
    id,
    createdAt: now,
    updatedAt: now
  });
  return id;
}

export async function getMaterials(options?: {
  categoryId?: string;
  isFree?: boolean;
  tags?: string[];
  limit?: number;
  sortBy?: 'downloads' | 'price' | 'date';
}): Promise<Material[]> {
  const db = await getDB();
  let materials: Material[];

  if (options?.categoryId) {
    materials = await db.getAllFromIndex('materials', 'by-category', options.categoryId);
  } else {
    materials = await db.getAll('materials');
  }

  // 过滤免费素材
  if (options?.isFree !== undefined) {
    materials = materials.filter(m =>
      options.isFree ? m.price === 0 : m.price > 0
    );
  }

  // 按标签过滤
  if (options?.tags && options.tags.length > 0) {
    materials = materials.filter(m =>
      m.tags.some(tag => options.tags!.includes(tag))
    );
  }

  // 只显示激活的素材
  materials = materials.filter(m => m.isActive);

  // 排序
  if (options?.sortBy === 'downloads') {
    materials.sort((a, b) => b.downloadCount - a.downloadCount);
  } else if (options?.sortBy === 'price') {
    materials.sort((a, b) => a.price - b.price);
  } else {
    materials.sort((a, b) => b.createdAt - a.createdAt);
  }

  // 限制数量
  if (options?.limit) {
    materials = materials.slice(0, options.limit);
  }

  return materials;
}

export async function getMaterialById(id: string): Promise<Material | undefined> {
  const db = await getDB();
  return db.get('materials', id);
}

export async function addMaterial(material: Omit<Material, 'id' | 'downloadCount' | 'likeCount' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  await db.put('materials', {
    ...material,
    id,
    downloadCount: 0,
    likeCount: 0,
    createdAt: now,
    updatedAt: now
  });
  return id;
}

export async function updateMaterial(material: Material): Promise<void> {
  const db = await getDB();
  await db.put('materials', {
    ...material,
    updatedAt: Date.now()
  });
}

export async function incrementMaterialDownload(id: string, userId: string, ipAddress: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['materials', 'downloadRecords'], 'readwrite');
  const now = Date.now();

  // 更新下载计数
  const material = await tx.objectStore('materials').get(id);
  if (material) {
    material.downloadCount += 1;
    await tx.objectStore('materials').put(material);

    // 记录下载
    const recordId = generateId();
    await tx.objectStore('downloadRecords').put({
      id: recordId,
      userId,
      materialId: id,
      materialTitle: material.title,
      downloadTime: now,
      ipAddress
    });
  }

  await tx.done;
}

export async function deleteMaterial(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('materials', id);
}

// ==================== 收藏相关服务 ====================

export async function getUserFavorites(userId: string): Promise<UserFavorite[]> {
  const db = await getDB();
  return db.getAllFromIndex('userFavorites', 'by-user', userId);
}

export async function toggleFavorite(userId: string, itemType: 'portfolio' | 'material', itemId: string): Promise<boolean> {
  const db = await getDB();
  const tx = db.transaction('userFavorites', 'readwrite');

  // 检查是否已收藏
  const existing = await tx.store.getFromIndex('by-user-item', [userId, itemType, itemId]);

  if (existing) {
    // 取消收藏
    await tx.store.delete(existing.id);
    await tx.done;
    return false;
  } else {
    // 添加收藏
    const now = Date.now();
    const id = generateId();
    await tx.store.put({
      id,
      userId,
      itemType,
      itemId,
      createdAt: now
    });
    await tx.done;
    return true;
  }
}

// ==================== 数据统计相关服务 ====================

export async function getAnalytics(startDate?: string, endDate?: string): Promise<Analytics[]> {
  const db = await getDB();
  let analytics = await db.getAllFromIndex('analytics', 'by-date');

  // 按日期范围过滤
  if (startDate || endDate) {
    analytics = analytics.filter(a => {
      const date = a.date;
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      return true;
    });
  }

  return analytics;
}

export async function addAnalytics(analytics: Omit<Analytics, 'id' | 'createdAt'>): Promise<string> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  await db.put('analytics', {
    ...analytics,
    id,
    createdAt: now
  });
  return id;
}

export async function getDailyStats(): Promise<{
  totalPortfolios: number;
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  totalReviews: number;
}> {
  const db = await getDB();
  const portfolios = await db.getAll('portfolios');
  const orders = await db.getAll('orders');
  const reviews = await db.getAll('reviews');

  const totalViews = portfolios.reduce((sum, p) => sum + p.viewCount, 0);
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    totalPortfolios: portfolios.length,
    totalViews,
    totalOrders: orders.length,
    totalRevenue,
    totalReviews: reviews.length
  };
}

// ==================== 用户相关服务 ====================

export async function getUsers(role?: User['role']): Promise<User[]> {
  const db = await getDB();
  let users: User[];

  if (role) {
    users = await db.getAllFromIndex('users', 'by-role', role);
  } else {
    users = await db.getAll('users');
  }

  return users;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const db = await getDB();
  return db.get('users', id);
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const db = await getDB();
  return db.getFromIndex('users', 'by-username', username);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDB();
  return db.getFromIndex('users', 'by-email', email);
}

export async function addUser(user: Omit<User, 'id' | 'lastLoginAt' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  await db.put('users', {
    ...user,
    id,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now
  });
  return id;
}

export async function updateUser(user: User): Promise<void> {
  const db = await getDB();
  await db.put('users', {
    ...user,
    updatedAt: Date.now()
  });
}

export async function updateLastLogin(userId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('users', 'readwrite');
  const user = await tx.store.get(userId);
  if (user) {
    user.lastLoginAt = Date.now();
    await tx.store.put(user);
  }
  await tx.done;
}

// ==================== 操作日志相关服务 ====================

export async function addOperationLog(log: Omit<OperationLog, 'id' | 'createdAt'>): Promise<string> {
  const db = await getDB();
  const now = Date.now();
  const id = generateId();
  await db.put('operationLogs', {
    ...log,
    id,
    createdAt: now
  });
  return id;
}

export async function getOperationLogs(options?: {
  userId?: string;
  module?: string;
  action?: string;
  limit?: number;
}): Promise<OperationLog[]> {
  const db = await getDB();
  let logs: OperationLog[];

  if (options?.userId) {
    logs = await db.getAllFromIndex('operationLogs', 'by-user', options.userId);
  } else if (options?.module) {
    logs = await db.getAllFromIndex('operationLogs', 'by-module', options.module);
  } else if (options?.action) {
    logs = await db.getAllFromIndex('operationLogs', 'by-action', options.action);
  } else {
    logs = await db.getAll('operationLogs');
  }

  // 按时间降序排序
  logs.sort((a, b) => b.createdAt - a.createdAt);

  // 限制数量
  if (options?.limit) {
    logs = logs.slice(0, options.limit);
  }

  return logs;
}

// ==================== 登录记录相关服务 ====================

export async function addLoginRecord(record: Omit<LoginRecord, 'id' | 'logoutTime'>): Promise<string> {
  const db = await getDB();
  const id = generateId();
  await db.put('loginRecords', {
    ...record,
    id,
    logoutTime: null
  });
  return id;
}

export async function getLoginRecords(userId: string, limit?: number): Promise<LoginRecord[]> {
  const db = await getDB();
  let records = await db.getAllFromIndex('loginRecords', 'by-user', userId);

  // 按时间降序排序
  records.sort((a, b) => b.loginTime - a.loginTime);

  // 限制数量
  if (limit) {
    records = records.slice(0, limit);
  }

  return records;
}

export async function updateLogoutTime(recordId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('loginRecords', 'readwrite');
  const record = await tx.store.get(recordId);
  if (record) {
    record.logoutTime = Date.now();
    await tx.store.put(record);
  }
  await tx.done;
}
