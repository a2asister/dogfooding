export type RoomType = 'standard' | 'king' | 'suite' | 'deluxe';
export type RoomStatus = 'available' | 'booked' | 'occupied' | 'cleaning' | 'maintenance';
export type OrderStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type CustomerType = 'new' | 'regular' | 'vip';
export type UserRole = 'admin' | 'manager' | 'reception' | 'housekeeping';
export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed';
export type WorkOrderType = 'cleaning' | 'maintenance';
export type PriceType = 'base' | 'weekend' | 'holiday' | 'hourly' | 'long_term';
export type DiscountType = 'percentage' | 'fixed' | 'package';

export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  floor: number;
  area: number;
  capacity: number;
  facilities: string[];
  orientation: string;
  status: RoomStatus;
  basePrice: number;
  description: string;
  lastCleaned?: string;
  maintenanceDate?: string;
}

export interface WorkOrder {
  id: string;
  roomId: string;
  roomNumber: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string[];
}

export interface PriceStrategy {
  id: string;
  name: string;
  roomType: RoomType;
  priceType: PriceType;
  basePrice: number;
  minDays?: number;
  maxDays?: number;
  startDate?: string;
  endDate?: string;
  daysOfWeek?: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DynamicPricingRule {
  id: string;
  name: string;
  roomType: RoomType;
  triggerType: 'inventory' | 'demand' | 'competitor';
  triggerValue: number;
  adjustmentType: 'percentage' | 'fixed';
  adjustmentValue: number;
  isActive: boolean;
}

export interface Discount {
  id: string;
  name: string;
  type: DiscountType;
  value: number;
  minOrderAmount?: number;
  applicableRoomTypes: RoomType[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  code?: string;
  maxUses?: number;
  usedCount: number;
}

export interface PriceHistory {
  id: string;
  roomType: RoomType;
  priceType: PriceType;
  oldPrice: number;
  newPrice: number;
  changedBy: string;
  changedAt: string;
  reason: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  idType: 'id_card' | 'passport';
  idNumber: string;
  type: CustomerType;
  address?: string;
  createdAt: string;
  totalStays: number;
  totalSpent: number;
  lastStayDate?: string;
  preferences?: string[];
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  roomId?: string;
  roomNumber?: string;
  roomType: RoomType;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guests: number;
  baseAmount: number;
  discountAmount: number;
  extraCharges: ExtraCharge[];
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  status: OrderStatus;
  channel: 'online' | 'offline' | 'third_party';
  source?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface ExtraCharge {
  id: string;
  name: string;
  amount: number;
  quantity: number;
  unit: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  phone: string;
  email?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface DailyStats {
  date: string;
  totalRooms: number;
  occupiedRooms: number;
  bookedRooms: number;
  availableRooms: number;
  occupancyRate: number;
  bookingRate: number;
  totalRevenue: number;
  avgDailyRate: number;
  revPar: number;
  newCustomers: number;
  checkIns: number;
  checkOuts: number;
}

export interface RevenueBreakdown {
  date: string;
  roomRevenue: number;
  extraRevenue: number;
  discount: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface ExceptionReport {
  id: string;
  roomId: string;
  roomNumber: string;
  type: 'damage' | 'complaint' | 'other';
  title: string;
  description: string;
  reporter: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
  images?: string[];
}

export const ROOM_TYPE_NAMES: Record<RoomType, string> = {
  standard: '标准间',
  king: '大床房',
  suite: '套房',
  deluxe: '豪华间',
};

export const ROOM_STATUS_NAMES: Record<RoomStatus, string> = {
  available: '空闲',
  booked: '已预订',
  occupied: '已入住',
  cleaning: '待清洁',
  maintenance: '维修中',
};

export const ORDER_STATUS_NAMES: Record<OrderStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  checked_in: '已入住',
  checked_out: '已退房',
  cancelled: '已取消',
};

export const CUSTOMER_TYPE_NAMES: Record<CustomerType, string> = {
  new: '新客户',
  regular: '老客户',
  vip: 'VIP客户',
};

export const USER_ROLE_NAMES: Record<UserRole, string> = {
  admin: '管理员',
  manager: '经理',
  reception: '前台',
  housekeeping: '客房服务',
};

export const WORK_ORDER_STATUS_NAMES: Record<WorkOrderStatus, string> = {
  pending: '待处理',
  in_progress: '处理中',
  completed: '已完成',
};

export const WORK_ORDER_TYPE_NAMES: Record<WorkOrderType, string> = {
  cleaning: '清洁工单',
  maintenance: '维修工单',
};

export const PRICE_TYPE_NAMES: Record<PriceType, string> = {
  base: '基础价格',
  weekend: '周末价格',
  holiday: '节假日价格',
  hourly: '钟点房价格',
  long_term: '长租价格',
};
