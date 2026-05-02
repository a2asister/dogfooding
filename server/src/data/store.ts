import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { 
  Department, 
  Budget, 
  ExpenseApplication, 
  User,
  ExpenseCategory
} from '../types';

const DATA_DIR = path.join(__dirname, '../../../data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readData<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    return defaultValue;
  }
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return defaultValue;
  }
}

function writeData<T>(filename: string, data: T): void {
  ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId(): string {
  return uuidv4();
}

const initialDepartments: Department[] = [
  { id: 'dept-001', name: '技术部' },
  { id: 'dept-002', name: '市场部' },
  { id: 'dept-003', name: '财务部' },
  { id: 'dept-004', name: '人力资源部' },
  { id: 'dept-005', name: '产品部' }
];

const initialUsers: User[] = [
  { id: 'user-001', name: '张三', departmentId: 'dept-001', departmentName: '技术部', role: 'manager' },
  { id: 'user-002', name: '李四', departmentId: 'dept-001', departmentName: '技术部', role: 'employee' },
  { id: 'user-003', name: '王五', departmentId: 'dept-002', departmentName: '市场部', role: 'manager' },
  { id: 'user-004', name: '赵六', departmentId: 'dept-003', departmentName: '财务部', role: 'admin' },
  { id: 'user-005', name: '钱七', departmentId: 'dept-005', departmentName: '产品部', role: 'employee' }
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const initialBudgets: Budget[] = [
  {
    id: 'budget-001',
    departmentId: 'dept-001',
    departmentName: '技术部',
    year: currentYear,
    month: currentMonth,
    totalAmount: 50000,
    usedAmount: 15000,
    locked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'budget-002',
    departmentId: 'dept-002',
    departmentName: '市场部',
    year: currentYear,
    month: currentMonth,
    totalAmount: 80000,
    usedAmount: 25000,
    locked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'budget-003',
    departmentId: 'dept-003',
    departmentName: '财务部',
    year: currentYear,
    month: currentMonth,
    totalAmount: 30000,
    usedAmount: 5000,
    locked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'budget-004',
    departmentId: 'dept-004',
    departmentName: '人力资源部',
    year: currentYear,
    month: currentMonth,
    totalAmount: 40000,
    usedAmount: 10000,
    locked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'budget-005',
    departmentId: 'dept-005',
    departmentName: '产品部',
    year: currentYear,
    month: currentMonth,
    totalAmount: 60000,
    usedAmount: 20000,
    locked: true,
    lockedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialApplications: ExpenseApplication[] = [
  {
    id: 'app-001',
    title: '技术部办公设备采购',
    applicantId: 'user-002',
    applicantName: '李四',
    departmentId: 'dept-001',
    departmentName: '技术部',
    status: 'approved',
    totalAmount: 8500,
    description: '采购鼠标、键盘、显示器等办公设备',
    items: [
      { id: 'item-001', category: '办公费', description: '机械键盘 x 5', amount: 2500 },
      { id: 'item-002', category: '办公费', description: '27寸显示器 x 2', amount: 6000 }
    ],
    approverId: 'user-001',
    approverName: '张三',
    approvalComment: '设备采购合理，批准通过',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    approvedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'app-002',
    title: '市场推广差旅费',
    applicantId: 'user-003',
    applicantName: '王五',
    departmentId: 'dept-002',
    departmentName: '市场部',
    status: 'pending',
    totalAmount: 12000,
    description: '前往上海参加行业展会的差旅费用',
    items: [
      { id: 'item-003', category: '差旅费', description: '往返机票', amount: 4000 },
      { id: 'item-004', category: '差旅费', description: '酒店住宿 3 天', amount: 3600 },
      { id: 'item-005', category: '业务招待费', description: '客户招待晚餐', amount: 4400 }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    submittedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'app-003',
    title: '员工培训费用',
    applicantId: 'user-005',
    applicantName: '钱七',
    departmentId: 'dept-005',
    departmentName: '产品部',
    status: 'draft',
    totalAmount: 5000,
    description: '产品经理进阶培训课程费用',
    items: [
      { id: 'item-006', category: '培训费', description: '产品经理进阶培训课程', amount: 5000 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class DataStore {
  private static instance: DataStore;
  
  private constructor() {}
  
  static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  getDepartments(): Department[] {
    return readData('departments.json', initialDepartments);
  }

  saveDepartments(departments: Department[]): void {
    writeData('departments.json', departments);
  }

  getUsers(): User[] {
    return readData('users.json', initialUsers);
  }

  saveUsers(users: User[]): void {
    writeData('users.json', users);
  }

  getBudgets(): Budget[] {
    return readData('budgets.json', initialBudgets);
  }

  getBudgetById(id: string): Budget | undefined {
    return this.getBudgets().find(b => b.id === id);
  }

  getBudgetByDepartment(departmentId: string, year: number, month: number): Budget | undefined {
    return this.getBudgets().find(
      b => b.departmentId === departmentId && b.year === year && b.month === month
    );
  }

  saveBudgets(budgets: Budget[]): void {
    writeData('budgets.json', budgets);
  }

  createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Budget {
    const budgets = this.getBudgets();
    const newBudget: Budget = {
      ...budget,
      id: `budget-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    budgets.push(newBudget);
    this.saveBudgets(budgets);
    return newBudget;
  }

  updateBudget(id: string, updates: Partial<Budget>): Budget | undefined {
    const budgets = this.getBudgets();
    const index = budgets.findIndex(b => b.id === id);
    if (index === -1) return undefined;
    
    budgets[index] = {
      ...budgets[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveBudgets(budgets);
    return budgets[index];
  }

  getApplications(): ExpenseApplication[] {
    return readData('applications.json', initialApplications);
  }

  getApplicationById(id: string): ExpenseApplication | undefined {
    return this.getApplications().find(a => a.id === id);
  }

  saveApplications(applications: ExpenseApplication[]): void {
    writeData('applications.json', applications);
  }

  createApplication(
    application: Omit<ExpenseApplication, 'id' | 'createdAt' | 'updatedAt'>
  ): ExpenseApplication {
    const applications = this.getApplications();
    const newApplication: ExpenseApplication = {
      ...application,
      id: `app-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    applications.push(newApplication);
    this.saveApplications(applications);
    return newApplication;
  }

  updateApplication(id: string, updates: Partial<ExpenseApplication>): ExpenseApplication | undefined {
    const applications = this.getApplications();
    const index = applications.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    
    applications[index] = {
      ...applications[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveApplications(applications);
    return applications[index];
  }

  generateId(): string {
    return generateId();
  }
}

export const dataStore = DataStore.getInstance();
