// 设计师个人信息类型
export interface Designer {
  id: string;
  name: string;
  avatar: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  experience: number; // 从业年限
  skills: string[];
  styles: string[];
  socialLinks: {
    platform: string;
    url: string;
  }[];
  createdAt: number;
  updatedAt: number;
}

// 从业履历类型
export interface WorkExperience {
  id: string;
  designerId: string;
  company: string;
  position: string;
  startDate: number;
  endDate: number | null;
  description: string;
  achievements: string[];
  createdAt: number;
  updatedAt: number;
}

// 作品分类类型
export interface PortfolioCategory {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

// 作品类型
export interface Portfolio {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  concept: string; // 创作理念
  parameters: {
    key: string;
    value: string;
  }[]; // 参数信息
  images: string[]; // 高清图URL
  detailImages: string[]; // 细节图URL
  videos: string[]; // 视频素材URL
  tags: string[];
  isPublished: boolean;
  isTop: boolean;
  sortOrder: number;
  viewCount: number;
  likeCount: number;
  createdAt: number;
  updatedAt: number;
}

// 案例项目类型
export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  client: string;
  projectType: string;
  startDate: number;
  endDate: number;
  processSteps: {
    step: number;
    title: string;
    description: string;
    images: string[];
  }[]; // 过程图文分步展示
  beforeAfter: {
    beforeImages: string[];
    afterImages: string[];
    description: string;
  }[]; // 前后效果对比
  tags: string[];
  isFeatured: boolean; // 是否热门推荐
  sortOrder: number;
  viewCount: number;
  createdAt: number;
  updatedAt: number;
}

// 服务套餐类型
export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  deliveryDays: number;
  revisionLimit: number; // 修改次数限制
  isActive: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

// 订单类型
export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'review' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  description: string;
  requirements: string;
  files: string[];
  revisionsUsed: number;
  scheduledDate: number | null;
  completedDate: number | null;
  createdAt: number;
  updatedAt: number;
}

// 订单历史记录类型
export interface OrderHistory {
  id: string;
  orderId: string;
  status: string;
  description: string;
  createdBy: string;
  createdAt: number;
}

// 聊天会话类型
export interface ChatSession {
  id: string;
  participantName: string;
  participantEmail: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// 聊天消息类型
export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'designer';
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  isRead: boolean;
  readAt: number | null;
  createdAt: number;
}

// 快捷回复类型
export interface QuickReply {
  id: string;
  title: string;
  content: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// 评价类型
export interface Review {
  id: string;
  orderId: string;
  clientName: string;
  clientAvatar: string;
  rating: number; // 1-5 星
  title: string;
  content: string;
  images: string[];
  isPinned: boolean; // 是否置顶
  isFeatured: boolean; // 是否精选
  reply: string | null;
  replyAt: number | null;
  createdAt: number;
  updatedAt: number;
}

// 素材分类类型
export interface MaterialCategory {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

// 素材资源类型
export interface Material {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  thumbnail: string;
  fileUrl: string;
  fileType: 'image' | 'vector' | 'template' | 'font' | 'other';
  fileSize: number;
  price: number; // 0 表示免费
  tags: string[];
  downloadCount: number;
  likeCount: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// 用户收藏类型
export interface UserFavorite {
  id: string;
  userId: string;
  itemType: 'portfolio' | 'material';
  itemId: string;
  createdAt: number;
}

// 下载记录类型
export interface DownloadRecord {
  id: string;
  userId: string;
  materialId: string;
  materialTitle: string;
  downloadTime: number;
  ipAddress: string;
}

// 数据统计类型
export interface Analytics {
  id: string;
  date: string; // YYYY-MM-DD
  portfolioViews: number;
  consultations: number;
  orders: number;
  revenue: number;
  uniqueVisitors: number;
  pageViews: number;
  topPortfolios: {
    portfolioId: string;
    views: number;
  }[];
  createdAt: number;
}

// 访客记录类型
export interface Visitor {
  id: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  device: string;
  browser: string;
  os: string;
  country: string;
  city: string;
  landingPage: string;
  exitPage: string;
  pagesVisited: string[];
  duration: number; // 秒
  visitTime: number;
}

// 用户账号类型
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'designer' | 'sub_user';
  permissions: string[];
  isActive: boolean;
  lastLoginAt: number | null;
  createdAt: number;
  updatedAt: number;
}

// 子账号类型
export interface SubUser {
  id: string;
  parentUserId: string;
  username: string;
  email: string;
  passwordHash: string;
  permissions: string[];
  isActive: boolean;
  lastLoginAt: number | null;
  createdAt: number;
  updatedAt: number;
}

// 操作日志类型
export interface OperationLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  module: string;
  targetId: string | null;
  targetType: string | null;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: number;
}

// 登录记录类型
export interface LoginRecord {
  id: string;
  userId: string;
  username: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  ipAddress: string;
  location: string;
  userAgent: string;
  isSuccessful: boolean;
  failureReason: string | null;
  loginTime: number;
  logoutTime: number | null;
}

// 快捷回复分类
export const QUICK_REPLY_CATEGORIES = [
  '问候',
  '价格咨询',
  '项目咨询',
  '订单跟进',
  '售后问题',
  '其他'
] as const;

// 订单状态列表
export const ORDER_STATUSES = [
  { value: 'pending', label: '待确认', color: 'yellow' },
  { value: 'confirmed', label: '已确认', color: 'blue' },
  { value: 'in_progress', label: '进行中', color: 'purple' },
  { value: 'review', label: '待审核', color: 'orange' },
  { value: 'completed', label: '已完成', color: 'green' },
  { value: 'cancelled', label: '已取消', color: 'gray' },
  { value: 'refunded', label: '已退款', color: 'red' }
] as const;

// 付款状态列表
export const PAYMENT_STATUSES = [
  { value: 'pending', label: '待付款', color: 'yellow' },
  { value: 'paid', label: '已付款', color: 'green' },
  { value: 'partial', label: '部分付款', color: 'blue' },
  { value: 'refunded', label: '已退款', color: 'red' }
] as const;

// 权限列表
export const PERMISSIONS = [
  'portfolio:read',
  'portfolio:write',
  'portfolio:delete',
  'case_study:read',
  'case_study:write',
  'case_study:delete',
  'order:read',
  'order:write',
  'order:delete',
  'chat:read',
  'chat:write',
  'review:read',
  'review:write',
  'material:read',
  'material:write',
  'material:delete',
  'analytics:read',
  'user:read',
  'user:write',
  'user:delete',
  'sub_user:read',
  'sub_user:write',
  'sub_user:delete',
  'settings:read',
  'settings:write'
] as const;

export interface DailyStats {
  totalPortfolios: number;
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  totalReviews: number;
}
