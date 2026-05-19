export enum UserRole {
  USER = 'user',
  MERCHANT = 'merchant',
  OPERATOR = 'operator',
  ADMIN = 'admin'
}

export enum AuthStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export enum AuctionStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  ENDED = 'ended',
  CANCELLED = 'cancelled'
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface User {
  id: number;
  phone: string;
  nickname: string;
  avatar?: string;
  role: UserRole;
  realName?: string;
  idCard?: string;
  authStatus: AuthStatus;
  balance: number;
  frozenBalance: number;
  createdAt: string;
}

export interface AuctionItem {
  id: number;
  merchantId: number;
  title: string;
  description: string;
  images: string;
  category: string;
  startPrice: number;
  currentPrice: number;
  minIncrement: number;
  reservePrice?: number;
  startTime: string;
  endTime: string;
  status: AuctionStatus;
  viewCount: number;
  favoriteCount: number;
  bidCount: number;
  auditStatus: AuthStatus;
  auditReason?: string;
  createdAt: string;
  bids?: Bid[];
}

export interface Bid {
  id: number;
  auctionId: number;
  userId: number;
  amount: number;
  nickname?: string;
  isAutoBid: boolean;
  createdAt: string;
}

export interface Order {
  id: number;
  orderNo: string;
  auctionId: number;
  buyerId: number;
  sellerId: number;
  amount: number;
  depositAmount: number;
  commissionAmount: number;
  status: OrderStatus;
  payDeadline: string;
  paidAt?: string;
  createdAt: string;
  auctionTitle?: string;
  auctionImages?: string;
  buyerName?: string;
  sellerName?: string;
}

export interface Message {
  id: number;
  userId: number;
  type: 'system' | 'order' | 'auction' | 'sms';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Merchant {
  id: number;
  userId: number;
  companyName: string;
  businessLicense: string;
  contactName: string;
  contactPhone: string;
  authStatus: AuthStatus;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}
