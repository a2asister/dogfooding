export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  isSystem: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'alipay' | 'wechat' | 'credit' | 'other';
  balance: number;
  description?: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  description?: string;
  date: string;
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
  voucher?: string;
  tags?: string[];
}

export interface Asset {
  id: string;
  name: string;
  type: 'bank_deposit' | 'fixed_deposit' | 'wealth_management' | 'fund' | 'stock' | 'other_asset';
  value: number;
  expectedReturn?: number;
  maturityDate?: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Liability {
  id: string;
  name: string;
  type: 'mortgage' | 'car_loan' | 'credit_card' | 'personal_loan' | 'other_liability';
  totalAmount: number;
  remainingAmount: number;
  interestRate?: number;
  monthlyPayment?: number;
  nextPaymentDate?: string;
  endDate?: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  name: string;
  categoryId: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  notificationThreshold: number;
}

export interface OperationLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  description: string;
  details: Record<string, unknown>;
  ip?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'payment_due' | 'budget_warning' | 'budget_over' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

export interface AppData {
  users: User[];
  categories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  assets: Asset[];
  liabilities: Liability[];
  budgets: Budget[];
  logs: OperationLog[];
  notifications: Notification[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export type TransactionQueryParams = {
  type?: 'income' | 'expense' | 'transfer';
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  createdBy?: string;
  isPublic?: boolean;
};

export type BudgetProgress = {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
};
