export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  price: number;
  priceUnit: "month" | "total";
  area: number;
  bedrooms: number;
  bathrooms: number;
  address: string;
  district: string;
  city?: string;
  status: PropertyStatus;
  description: string;
  features: string[];
  images: string[];
  owner: {
    id?: string;
    name: string;
    phone: string;
    idCard?: string;
  };
  assignedAgent?: {
    id: string;
    name: string;
    phone?: string;
    avatar?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  statusHistory?: StatusHistory[];
}

export interface StatusHistory {
  id: string;
  status: PropertyStatus;
  changedAt: string;
  changedBy: {
    id: string;
    name: string;
  };
  reason: string;
}

export type PropertyType =
  | "apartment"
  | "house"
  | "villa"
  | "commercial"
  | "office"
  | "shop"
  | "industrial";

export type PropertyStatus =
  | "available"
  | "reserved"
  | "rented"
  | "sold"
  | "offline"
  | "maintenance";

export interface Client {
  id: string;
  name: string;
  phone: string;
  idCard?: string;
  type: ClientType;
  status: ClientStatus;
  source: string;
  tags: string[];
  requirements?: {
    type?: PropertyType[];
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    bedrooms?: number[];
    districts?: string[];
    features?: string[];
  };
  budgetMin?: number;
  budgetMax?: number;
  preferredAreas?: string[];
  assignedAgent?: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
  inSea: boolean;
  lastContact?: string;
  lastFollowUpAt?: string;
  nextFollowUp?: string;
  followUpCount: number;
  dealCount: number;
  totalDealAmount: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type ClientType = "buyer" | "tenant" | "both";

export type ClientStatus = "active" | "inactive" | "lost" | "converted";

export interface FollowUpRecord {
  id: string;
  clientId: string;
  clientName?: string;
  agentId: string;
  agent: {
    id: string;
    name: string;
  };
  agentName?: string;
  type: string;
  content: string;
  properties?: string[];
  nextFollowUpAt?: string;
  createdAt: string;
  attachments?: string[];
}

export type FollowUpType = "phone" | "wechat" | "visit" | "viewing" | "other";

export interface Viewing {
  id: string;
  propertyId: string;
  propertyTitle: string;
  clientId: string;
  clientName: string;
  agentId: string;
  agentName: string;
  date: string;
  time: string;
  status: ViewingStatus;
  notes: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export type ViewingStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";

export interface Contract {
  id: string;
  contractNo?: string;
  type: ContractType;
  propertyId: string;
  propertyTitle: string;
  clientId: string;
  clientName: string;
  ownerName: string;
  ownerPhone?: string;
  amount: number;
  deposit?: number;
  startDate?: string;
  endDate?: string;
  status: ContractStatus;
  agentId?: string;
  agentName?: string;
  commission: number;
  commissionPaid?: boolean;
  createdAt: string;
  updatedAt?: string;
  attachments?: string[];
}

export type ContractType = "sale" | "rental";

export type ContractStatus = "draft" | "pending" | "signed" | "completed" | "terminated";

export interface Commission {
  id: string;
  contractId: string;
  contractNo: string;
  agentId: string;
  agentName: string;
  amount: number;
  rate: number;
  status: CommissionStatus;
  paidAt?: string;
  createdAt: string;
}

export type CommissionStatus = "pending" | "approved" | "paid" | "rejected";

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerId?: string;
  managerName?: string;
  employeeCount: number;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  actions?: ("read" | "create" | "update" | "delete")[];
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  roleId: string;
  roleName: string;
  roles: {
    id: string;
    name: string;
    description?: string;
  }[];
  storeId: string;
  storeName: string;
  status: "active" | "inactive";
  createdAt: string;
  lastLogin?: string;
}

export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  storeId: string;
  storeName: string;
  action: string;
  module: string;
  targetType: string;
  targetId: string;
  targetName: string;
  details: string;
  ip: string;
  createdAt: string;
}

export interface Dictionary {
  id: string;
  code: string;
  name: string;
  items: DictionaryItem[];
  description: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DictionaryItem {
  id: string;
  label: string;
  value: string;
  sort: number;
  status: "active" | "inactive";
}

export interface Reminder {
  id: string;
  type: string;
  title: string;
  content: string;
  relatedId?: string;
  relatedType?: string;
  targetType?: string;
  targetId?: string;
  userId?: string;
  storeId?: string;
  scheduledAt: string;
  isRead: boolean;
  isCompleted: boolean;
  createdAt: string;
}

export type ReminderType = "viewing" | "follow_up" | "contract" | "commission" | "birthday" | "other";

export interface DashboardStats {
  totalProperties: number;
  availableProperties: number;
  totalClients: number;
  activeClients: number;
  totalContracts: number;
  monthlyRevenue: number;
  monthlyCommission: number;
  pendingViewings: number;
  pendingFollowUps: number;
}

export interface TrendData {
  month: string;
  sales: number;
  rentals: number;
  revenue: number;
  commission: number;
}

export interface PropertyDistribution {
  type: string;
  count: number;
  value: number;
}

export interface ClientConversion {
  stage: string;
  count: number;
}

export interface AgentPerformance {
  name: string;
  deals: number;
  revenue: number;
  commission: number;
}
