export interface Store {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface CustomerFlow {
  id: string;
  storeId: string;
  date: string;
  inCount: number;
  outCount: number;
  timestamp: string;
}

export interface Inventory {
  id: string;
  storeId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  unit: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  storeId: string;
  name: string;
  phone: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  totalSpent: number;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface Promotion {
  id: string;
  storeId: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'buyXGetY';
  discountValue: number;
  minPurchase: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
}

export interface Attendance {
  id: string;
  storeId: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: 'pending' | 'present' | 'absent' | 'late' | 'early';
}

export interface Employee {
  id: string;
  storeId: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface StoreSummary {
  storeId: string;
  storeName: string;
  totalInFlow: number;
  totalOutFlow: number;
  inventoryValue: number;
  inventoryItems: number;
  memberCount: number;
  attendanceCount: number;
}

export interface Overview {
  totalStores: number;
  activeStores: number;
  totalInFlow: number;
  totalOutFlow: number;
  totalInventoryValue: number;
  totalInventoryItems: number;
  totalMembers: number;
  activeMembers: number;
  totalMemberPoints: number;
  totalMemberSpent: number;
  totalPromotions: number;
  activePromotions: number;
  totalEmployees: number;
  activeEmployees: number;
}

export interface SummaryData {
  overview: Overview;
  storeSummaries: StoreSummary[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
