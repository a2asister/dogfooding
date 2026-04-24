import type {
  Room,
  WorkOrder,
  PriceStrategy,
  DynamicPricingRule,
  Discount,
  PriceHistory,
  Customer,
  Order,
  User,
  DailyStats,
  RevenueBreakdown,
  Notification,
  ExceptionReport,
} from '@/types';

export const mockRooms: Room[] = [
  { id: 'room_001', roomNumber: '101', type: 'standard', floor: 1, area: 25, capacity: 2, facilities: ['WiFi', '空调', '电视', '独立卫浴'], orientation: '朝南', status: 'available', basePrice: 288, description: '舒适标准间，配备基本设施', lastCleaned: '2026-04-23' },
  { id: 'room_002', roomNumber: '102', type: 'standard', floor: 1, area: 25, capacity: 2, facilities: ['WiFi', '空调', '电视', '独立卫浴'], orientation: '朝北', status: 'occupied', basePrice: 288, description: '舒适标准间，配备基本设施', lastCleaned: '2026-04-22' },
  { id: 'room_003', roomNumber: '103', type: 'standard', floor: 1, area: 25, capacity: 2, facilities: ['WiFi', '空调', '电视', '独立卫浴', '迷你吧'], orientation: '朝南', status: 'booked', basePrice: 288, description: '舒适标准间，配备迷你吧', lastCleaned: '2026-04-23' },
  { id: 'room_004', roomNumber: '104', type: 'standard', floor: 1, area: 25, capacity: 2, facilities: ['WiFi', '空调', '电视', '独立卫浴'], orientation: '朝北', status: 'cleaning', basePrice: 288, description: '舒适标准间，配备基本设施' },
  { id: 'room_005', roomNumber: '201', type: 'king', floor: 2, area: 30, capacity: 2, facilities: ['WiFi', '空调', '电视', '独立卫浴', '大床', '迷你吧'], orientation: '朝南', status: 'available', basePrice: 388, description: '豪华大床房，温馨舒适', lastCleaned: '2026-04-23' },
  { id: 'room_006', roomNumber: '202', type: 'king', floor: 2, area: 30, capacity: 2, facilities: ['WiFi', '空调', '电视', '独立卫浴', '大床', '迷你吧'], orientation: '朝南', status: 'occupied', basePrice: 388, description: '豪华大床房，温馨舒适', lastCleaned: '2026-04-22' },
  { id: 'room_007', roomNumber: '203', type: 'king', floor: 2, area: 30, capacity: 2, facilities: ['WiFi', '空调', '电视', '独立卫浴', '大床'], orientation: '朝北', status: 'available', basePrice: 388, description: '豪华大床房，温馨舒适', lastCleaned: '2026-04-23' },
  { id: 'room_008', roomNumber: '204', type: 'king', floor: 2, area: 30, capacity: 2, facilities: ['WiFi', '空调', '电视', '独立卫浴', '大床', '迷你吧'], orientation: '朝南', status: 'booked', basePrice: 388, description: '豪华大床房，温馨舒适', lastCleaned: '2026-04-23' },
  { id: 'room_009', roomNumber: '301', type: 'deluxe', floor: 3, area: 40, capacity: 2, facilities: ['WiFi', '空调', '智能电视', '独立卫浴', '大床', '迷你吧', '浴缸'], orientation: '朝南', status: 'available', basePrice: 588, description: '豪华间，配备浴缸和智能设施', lastCleaned: '2026-04-23' },
  { id: 'room_010', roomNumber: '302', type: 'deluxe', floor: 3, area: 40, capacity: 2, facilities: ['WiFi', '空调', '智能电视', '独立卫浴', '大床', '迷你吧', '浴缸'], orientation: '朝南', status: 'occupied', basePrice: 588, description: '豪华间，配备浴缸和智能设施', lastCleaned: '2026-04-21' },
  { id: 'room_011', roomNumber: '303', type: 'deluxe', floor: 3, area: 40, capacity: 2, facilities: ['WiFi', '空调', '智能电视', '独立卫浴', '大床', '迷你吧', '浴缸'], orientation: '朝北', status: 'maintenance', basePrice: 588, description: '豪华间，配备浴缸和智能设施', maintenanceDate: '2026-04-23' },
  { id: 'room_012', roomNumber: '401', type: 'suite', floor: 4, area: 60, capacity: 4, facilities: ['WiFi', '中央空调', '智能电视', '独立卫浴', '大床', '沙发床', '迷你吧', '浴缸', '会客厅'], orientation: '朝南', status: 'available', basePrice: 888, description: '豪华套房，配备会客厅', lastCleaned: '2026-04-23' },
  { id: 'room_013', roomNumber: '402', type: 'suite', floor: 4, area: 60, capacity: 4, facilities: ['WiFi', '中央空调', '智能电视', '独立卫浴', '大床', '沙发床', '迷你吧', '浴缸', '会客厅'], orientation: '朝南', status: 'booked', basePrice: 888, description: '豪华套房，配备会客厅', lastCleaned: '2026-04-23' },
];

export const mockWorkOrders: WorkOrder[] = [
  { id: 'wo_001', roomId: 'room_004', roomNumber: '104', type: 'cleaning', status: 'in_progress', priority: 'high', title: '客房清洁', description: '客人退房后需要全面清洁', createdBy: 'reception_001', assignedTo: 'housekeeping_001', createdAt: '2026-04-24T09:00:00', startedAt: '2026-04-24T09:30:00', notes: ['需要更换床单被套', '检查卫生间设施'] },
  { id: 'wo_002', roomId: 'room_011', roomNumber: '303', type: 'maintenance', status: 'pending', priority: 'high', title: '空调维修', description: '空调无法制冷，需要维修', createdBy: 'manager_001', createdAt: '2026-04-24T10:15:00' },
  { id: 'wo_003', roomId: 'room_002', roomNumber: '102', type: 'maintenance', status: 'completed', priority: 'low', title: '灯泡更换', description: '床头灯灯泡损坏', createdBy: 'reception_002', assignedTo: 'housekeeping_002', createdAt: '2026-04-23T14:00:00', startedAt: '2026-04-23T14:30:00', completedAt: '2026-04-23T15:00:00', notes: ['已更换为LED灯泡'] },
];

export const mockPriceStrategies: PriceStrategy[] = [
  { id: 'ps_001', name: '标准间基础价格', roomType: 'standard', priceType: 'base', basePrice: 288, isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-04-20T10:00:00' },
  { id: 'ps_002', name: '大床房基础价格', roomType: 'king', priceType: 'base', basePrice: 388, isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-04-20T10:00:00' },
  { id: 'ps_003', name: '豪华间基础价格', roomType: 'deluxe', priceType: 'base', basePrice: 588, isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-04-20T10:00:00' },
  { id: 'ps_004', name: '套房基础价格', roomType: 'suite', priceType: 'base', basePrice: 888, isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-04-20T10:00:00' },
  { id: 'ps_005', name: '标准间周末价格', roomType: 'standard', priceType: 'weekend', basePrice: 328, daysOfWeek: [5, 6], isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-04-20T10:00:00' },
  { id: 'ps_006', name: '大床房周末价格', roomType: 'king', priceType: 'weekend', basePrice: 438, daysOfWeek: [5, 6], isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-04-20T10:00:00' },
  { id: 'ps_007', name: '五一端假日价格', roomType: 'standard', priceType: 'holiday', basePrice: 388, startDate: '2026-05-01', endDate: '2026-05-05', isActive: true, createdAt: '2026-04-10T00:00:00', updatedAt: '2026-04-10T00:00:00' },
  { id: 'ps_008', name: '标准间钟点房', roomType: 'standard', priceType: 'hourly', basePrice: 88, minDays: 3, isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-04-20T10:00:00' },
  { id: 'ps_009', name: '长租优惠（7天以上）', roomType: 'standard', priceType: 'long_term', basePrice: 248, minDays: 7, isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-04-20T10:00:00' },
];

export const mockDynamicPricingRules: DynamicPricingRule[] = [
  { id: 'dpr_001', name: '库存紧张调价', roomType: 'standard', triggerType: 'inventory', triggerValue: 30, adjustmentType: 'percentage', adjustmentValue: 15, isActive: true },
  { id: 'dpr_002', name: '需求高峰调价', roomType: 'king', triggerType: 'demand', triggerValue: 80, adjustmentType: 'percentage', adjustmentValue: 20, isActive: true },
  { id: 'dpr_003', name: '库存充足降价', roomType: 'suite', triggerType: 'inventory', triggerValue: 70, adjustmentType: 'percentage', adjustmentValue: -10, isActive: true },
];

export const mockDiscounts: Discount[] = [
  { id: 'disc_001', name: '新客户首单9折', type: 'percentage', value: 10, applicableRoomTypes: ['standard', 'king', 'deluxe', 'suite'], startDate: '2026-01-01', endDate: '2026-12-31', isActive: true, code: 'NEW10', usedCount: 45 },
  { id: 'disc_002', name: '满3天减50', type: 'fixed', value: 50, minOrderAmount: 800, applicableRoomTypes: ['standard', 'king'], startDate: '2026-04-01', endDate: '2026-06-30', isActive: true, usedCount: 23 },
  { id: 'disc_003', name: '周末套餐', type: 'package', value: 100, applicableRoomTypes: ['king', 'deluxe', 'suite'], startDate: '2026-04-01', endDate: '2026-06-30', isActive: true, code: 'WEEKEND', usedCount: 12 },
  { id: 'disc_004', name: 'VIP客户85折', type: 'percentage', value: 15, applicableRoomTypes: ['standard', 'king', 'deluxe', 'suite'], startDate: '2026-01-01', endDate: '2026-12-31', isActive: true, usedCount: 67 },
];

export const mockPriceHistory: PriceHistory[] = [
  { id: 'ph_001', roomType: 'standard', priceType: 'base', oldPrice: 268, newPrice: 288, changedBy: 'manager_001', changedAt: '2026-04-20T10:00:00', reason: '旺季价格调整' },
  { id: 'ph_002', roomType: 'king', priceType: 'base', oldPrice: 368, newPrice: 388, changedBy: 'manager_001', changedAt: '2026-04-20T10:05:00', reason: '旺季价格调整' },
  { id: 'ph_003', roomType: 'suite', priceType: 'weekend', oldPrice: 988, newPrice: 888, changedBy: 'manager_001', changedAt: '2026-04-15T14:00:00', reason: '促销活动降价' },
];

export const mockCustomers: Customer[] = [
  { id: 'cust_001', name: '张三', phone: '13800138001', email: 'zhangsan@example.com', idType: 'id_card', idNumber: '110101199001011234', type: 'regular', address: '北京市朝阳区', createdAt: '2025-03-15T10:00:00', totalStays: 8, totalSpent: 4560, lastStayDate: '2026-04-20', preferences: ['无烟房', '高楼层'], notes: '企业客户，需要发票' },
  { id: 'cust_002', name: '李四', phone: '13800138002', idType: 'id_card', idNumber: '110101199202022345', type: 'new', createdAt: '2026-04-22T14:30:00', totalStays: 1, totalSpent: 388, lastStayDate: '2026-04-22', preferences: ['大床'] },
  { id: 'cust_003', name: '王五', phone: '13900139003', email: 'wangwu@example.com', idType: 'passport', idNumber: 'E12345678', type: 'vip', address: '上海市浦东新区', createdAt: '2024-06-10T09:00:00', totalStays: 25, totalSpent: 35600, lastStayDate: '2026-04-18', preferences: ['套房', '早餐', '行政酒廊'], notes: 'VIP金卡会员，享有升级权限' },
  { id: 'cust_004', name: '赵六', phone: '13700137004', idType: 'id_card', idNumber: '440101198808083456', type: 'regular', createdAt: '2025-11-20T16:00:00', totalStays: 5, totalSpent: 2840, lastStayDate: '2026-04-15', preferences: ['标准间'] },
  { id: 'cust_005', name: 'John Smith', phone: '13600136005', email: 'john@example.com', idType: 'passport', idNumber: 'USA1234567', type: 'new', createdAt: '2026-04-23T11:00:00', totalStays: 1, totalSpent: 588, lastStayDate: '2026-04-23', preferences: ['豪华间', '英语服务'] },
];

export const mockOrders: Order[] = [
  { id: 'ord_001', orderNumber: 'ORD202604240001', customerId: 'cust_001', customerName: '张三', customerPhone: '13800138001', roomId: 'room_002', roomNumber: '102', roomType: 'standard', checkInDate: '2026-04-24', checkOutDate: '2026-04-26', nights: 2, guests: 2, baseAmount: 576, discountAmount: 50, extraCharges: [], totalAmount: 526, paidAmount: 526, paymentStatus: 'paid', status: 'checked_in', channel: 'online', source: '官网', specialRequests: '需要无烟房', createdAt: '2026-04-20T10:00:00', updatedAt: '2026-04-24T14:00:00', checkedInAt: '2026-04-24T14:00:00' },
  { id: 'ord_002', orderNumber: 'ORD202604240002', customerId: 'cust_003', customerName: '王五', customerPhone: '13900139003', roomId: 'room_010', roomNumber: '302', roomType: 'deluxe', checkInDate: '2026-04-23', checkOutDate: '2026-04-27', nights: 4, guests: 2, baseAmount: 2352, discountAmount: 352, extraCharges: [{ id: 'ec_001', name: '早餐', amount: 58, quantity: 2, unit: '份' }], totalAmount: 2116, paidAmount: 2116, paymentStatus: 'paid', status: 'checked_in', channel: 'offline', specialRequests: '需要行政酒廊权限，延迟退房至14:00', createdAt: '2026-04-22T16:00:00', updatedAt: '2026-04-23T10:00:00', checkedInAt: '2026-04-23T10:00:00' },
  { id: 'ord_003', orderNumber: 'ORD202604240003', customerId: 'cust_005', customerName: 'John Smith', customerPhone: '13600136005', roomId: 'room_006', roomNumber: '202', roomType: 'king', checkInDate: '2026-04-24', checkOutDate: '2026-04-25', nights: 1, guests: 1, baseAmount: 388, discountAmount: 0, extraCharges: [], totalAmount: 388, paidAmount: 388, paymentStatus: 'paid', status: 'checked_in', channel: 'third_party', source: '携程', createdAt: '2026-04-23T09:00:00', updatedAt: '2026-04-24T09:30:00', checkedInAt: '2026-04-24T09:30:00' },
  { id: 'ord_004', orderNumber: 'ORD202604240004', customerId: 'cust_002', customerName: '李四', customerPhone: '13800138002', roomType: 'standard', checkInDate: '2026-04-25', checkOutDate: '2026-04-27', nights: 2, guests: 2, baseAmount: 576, discountAmount: 57, extraCharges: [], totalAmount: 519, paidAmount: 100, paymentStatus: 'partial', status: 'confirmed', channel: 'online', source: '小程序', specialRequests: '需要高楼层房间', createdAt: '2026-04-22T14:30:00', updatedAt: '2026-04-22T14:30:00' },
  { id: 'ord_005', orderNumber: 'ORD202604240005', customerId: 'cust_004', customerName: '赵六', customerPhone: '13700137004', roomType: 'suite', checkInDate: '2026-04-28', checkOutDate: '2026-04-30', nights: 2, guests: 3, baseAmount: 1776, discountAmount: 177, extraCharges: [], totalAmount: 1599, paidAmount: 0, paymentStatus: 'pending', status: 'pending', channel: 'third_party', source: '美团', createdAt: '2026-04-24T11:00:00', updatedAt: '2026-04-24T11:00:00' },
  { id: 'ord_006', orderNumber: 'ORD202604240006', customerId: 'cust_001', customerName: '张三', customerPhone: '13800138001', roomType: 'king', checkInDate: '2026-05-01', checkOutDate: '2026-05-04', nights: 3, guests: 2, baseAmount: 1314, discountAmount: 50, extraCharges: [], totalAmount: 1264, paidAmount: 500, paymentStatus: 'partial', status: 'confirmed', channel: 'offline', specialRequests: '五一端预订，需要大床房', createdAt: '2026-04-15T10:00:00', updatedAt: '2026-04-15T10:00:00' },
];

export const mockUsers: User[] = [
  { id: 'admin_001', username: 'admin', password: 'admin123', name: '系统管理员', role: 'admin', phone: '13000000001', email: 'admin@hotel.com', isActive: true, createdAt: '2025-01-01T00:00:00', lastLoginAt: '2026-04-24T08:00:00' },
  { id: 'manager_001', username: 'manager', password: 'manager123', name: '李经理', role: 'manager', phone: '13000000002', email: 'manager@hotel.com', isActive: true, createdAt: '2025-01-01T00:00:00', lastLoginAt: '2026-04-24T08:30:00' },
  { id: 'reception_001', username: 'reception1', password: 'reception123', name: '小王', role: 'reception', phone: '13000000003', isActive: true, createdAt: '2025-03-15T00:00:00', lastLoginAt: '2026-04-24T09:00:00' },
  { id: 'reception_002', username: 'reception2', password: 'reception123', name: '小李', role: 'reception', phone: '13000000004', isActive: true, createdAt: '2025-05-20T00:00:00', lastLoginAt: '2026-04-23T14:00:00' },
  { id: 'housekeeping_001', username: 'housekeeping1', password: 'hk123', name: '张阿姨', role: 'housekeeping', phone: '13000000005', isActive: true, createdAt: '2025-02-10T00:00:00', lastLoginAt: '2026-04-24T09:30:00' },
  { id: 'housekeeping_002', username: 'housekeeping2', password: 'hk123', name: '李阿姨', role: 'housekeeping', phone: '13000000006', isActive: true, createdAt: '2025-06-01T00:00:00', lastLoginAt: '2026-04-23T16:00:00' },
];

export const generateMockDailyStats = (): DailyStats[] => {
  const stats: DailyStats[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const totalRooms = 13;
    const occupiedRooms = Math.floor(Math.random() * 6) + 4;
    const bookedRooms = Math.floor(Math.random() * 3) + 1;
    const availableRooms = totalRooms - occupiedRooms - bookedRooms;
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);
    const bookingRate = Math.round(((occupiedRooms + bookedRooms) / totalRooms) * 100);
    const avgDailyRate = 380 + Math.floor(Math.random() * 100) - 50;
    const totalRevenue = occupiedRooms * avgDailyRate;
    const revPar = Math.round(occupancyRate * avgDailyRate / 100);
    
    stats.push({
      date: dateStr,
      totalRooms,
      occupiedRooms,
      bookedRooms,
      availableRooms,
      occupancyRate,
      bookingRate,
      totalRevenue,
      avgDailyRate,
      revPar,
      newCustomers: Math.floor(Math.random() * 5) + 1,
      checkIns: Math.floor(Math.random() * 4) + 1,
      checkOuts: Math.floor(Math.random() * 4) + 1,
    });
  }
  
  return stats;
};

export const mockDailyStats = generateMockDailyStats();

export const generateMockRevenueBreakdown = (): RevenueBreakdown[] => {
  const breakdown: RevenueBreakdown[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    breakdown.push({
      date: dateStr,
      roomRevenue: 1500 + Math.floor(Math.random() * 1000),
      extraRevenue: 100 + Math.floor(Math.random() * 200),
      discount: 50 + Math.floor(Math.random() * 100),
    });
  }
  
  return breakdown;
};

export const mockRevenueBreakdown = generateMockRevenueBreakdown();

export const mockNotifications: Notification[] = [
  { id: 'notif_001', type: 'info', title: '新订单提醒', message: '客户赵六预订了套房，入住日期4月28日', isRead: false, createdAt: '2026-04-24T11:00:00', link: '/orders/ord_005' },
  { id: 'notif_002', type: 'warning', title: '客房异常提醒', message: '303房间空调故障，需要维修', isRead: false, createdAt: '2026-04-24T10:15:00', link: '/exceptions' },
  { id: 'notif_003', type: 'success', title: '入住办理成功', message: 'John Smith已办理入住，房间202', isRead: true, createdAt: '2026-04-24T09:30:00' },
  { id: 'notif_004', type: 'info', title: '今日待办提醒', message: '今日有3个待处理工单', isRead: false, createdAt: '2026-04-24T08:00:00', link: '/work-orders' },
];

export const mockExceptionReports: ExceptionReport[] = [
  { id: 'ex_001', roomId: 'room_011', roomNumber: '303', type: 'damage', title: '空调故障', description: '客人反映空调无法制冷，尝试调整温度无效', reporter: 'reception_001', status: 'open', createdAt: '2026-04-24T10:15:00' },
  { id: 'ex_002', roomId: 'room_010', roomNumber: '302', type: 'complaint', title: '噪音问题', description: '客人反映走廊有噪音，影响休息', reporter: 'reception_002', status: 'in_progress', createdAt: '2026-04-24T08:30:00', resolution: '已告知相关客人保持安静' },
  { id: 'ex_003', roomId: 'room_002', roomNumber: '102', type: 'damage', title: '淋浴喷头漏水', description: '客人退房时发现淋浴喷头有轻微漏水', reporter: 'housekeeping_001', status: 'resolved', createdAt: '2026-04-23T16:00:00', resolvedAt: '2026-04-24T09:00:00', resolution: '已更换密封垫圈' },
];

export const mockData = {
  rooms: mockRooms,
  workOrders: mockWorkOrders,
  priceStrategies: mockPriceStrategies,
  dynamicPricingRules: mockDynamicPricingRules,
  discounts: mockDiscounts,
  priceHistory: mockPriceHistory,
  customers: mockCustomers,
  orders: mockOrders,
  users: mockUsers,
  dailyStats: mockDailyStats,
  revenueBreakdown: mockRevenueBreakdown,
  notifications: mockNotifications,
  exceptionReports: mockExceptionReports,
};
