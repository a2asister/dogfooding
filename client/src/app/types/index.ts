export interface Department {
  id: string;
  name: string;
}

export interface Budget {
  id: string;
  departmentId: string;
  departmentName: string;
  year: number;
  month: number;
  totalAmount: number;
  usedAmount: number;
  locked: boolean;
  lockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory = 
  | '办公费' 
  | '差旅费' 
  | '业务招待费' 
  | '培训费' 
  | '会议费' 
  | '通讯费' 
  | '交通费' 
  | '福利费' 
  | '其他';

export interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receiptImage?: string;
  receiptData?: ReceiptData;
}

export interface ReceiptData {
  merchantName: string;
  date: string;
  amount: number;
  taxNo?: string;
  items?: string[];
  confidence: number;
}

export type ApplicationStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'rejected';

export interface ExpenseApplication {
  id: string;
  title: string;
  applicantId: string;
  applicantName: string;
  departmentId: string;
  departmentName: string;
  status: ApplicationStatus;
  items: ExpenseItem[];
  totalAmount: number;
  description: string;
  approverId?: string;
  approverName?: string;
  approvalComment?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
}

export interface User {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  role: 'employee' | 'manager' | 'admin';
  avatar?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Array<{
    path: string[];
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BudgetAnalysis {
  year: number;
  month: number;
  totalBudget: number;
  totalUsed: number;
  totalRemaining: number;
  overallUsageRate: number;
  departments: DepartmentBudget[];
}

export interface DepartmentBudget {
  departmentId: string;
  departmentName: string;
  totalBudget: number;
  usedAmount: number;
  remainingAmount: number;
  usageRate: number;
  locked: boolean;
}

export interface StatsData {
  year: number;
  month: number;
  budget: {
    total: number;
    used: number;
    remaining: number;
    usageRate: number;
    locked: number;
    totalDepartments: number;
  };
  applications: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    totalThisMonth: number;
  };
}

export interface ReceiptRecognitionResult {
  receiptData: ReceiptData;
  suggestedCategory: ExpenseCategory;
  rawText: string;
}

export interface CategoryOption {
  value: ExpenseCategory;
  label: string;
  description: string;
}

export interface ClassificationResult {
  category: ExpenseCategory;
  confidence: number;
  alternatives: string[];
}
