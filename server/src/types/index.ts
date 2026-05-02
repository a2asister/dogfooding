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
  description?: string;
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
