import { v4 as uuidv4 } from 'uuid';
import {
  AppData,
  User,
  Category,
  Account,
  Transaction,
  Asset,
  Liability,
  Budget,
  OperationLog,
  Notification,
  UserRole,
} from '../types';

const STORAGE_KEY = 'family_finance_data';
const AUTH_KEY = 'family_finance_auth';

const generateId = (): string => uuidv4();

const getCurrentTime = (): string => new Date().toISOString();

const defaultCategories: Category[] = [
  { id: generateId(), name: '工资', type: 'income', icon: '💼', color: '#52c41a', isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isSystem: true },
  { id: generateId(), name: '奖金', type: 'income', icon: '🎁', color: '#1890ff', isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isSystem: true },
  { id: generateId(), name: '投资收益', type: 'income', icon: '📈', color: '#722ed1', isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isSystem: true },
  { id: generateId(), name: '兼职', type: 'income', icon: '💪', color: '#fa8c16', isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isSystem: true },
  { id: generateId(), name: '其他收入', type: 'income', icon: '💰', color: '#a0d911', isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isSystem: true },
  { id: generateId(), name: '餐饮', type: 'expense', icon: '🍔', color: '#ff4d4f', isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isSystem: true },
  { id: generateId(), name: '交通', type: 'expense', icon: '🚗', color: '#1890ff', isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isSystem: true },
  { id: generateId(), name: '购物', type: 'expense', icon: '🛒', color: '#722ed1', isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isSystem: true },
  { id: generateId(), name: '娱乐', type: 'expense', icon: '🎮', color: '#fa8c16', isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isSystem: true },
  { id: generateId(), name: '住房', type: 'expense', icon: '🏠', color: '#13c2c2', isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isSystem: true },
  { id: generateId(), name: '医疗', type: 'expense', icon: '🏥', color: '#eb2f96', isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isSystem: true },
  { id: generateId(), name: '教育', type: 'expense', icon: '📚', color: '#2f54eb', isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isSystem: true },
  { id: generateId(), name: '通讯', type: 'expense', icon: '📱', color: '#52c41a', isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isSystem: true },
  { id: generateId(), name: '其他支出', type: 'expense', icon: '📝', color: '#8c8c8c', isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isSystem: true },
];

const defaultAccounts: Account[] = [
  { id: generateId(), name: '现金', type: 'cash', balance: 0, isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isActive: true },
  { id: generateId(), name: '微信钱包', type: 'wechat', balance: 0, isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isActive: true },
  { id: generateId(), name: '支付宝', type: 'alipay', balance: 0, isPublic: true, createdBy: 'system', createdAt: getCurrentTime(), isActive: true },
];

const getInitialData = (): AppData => ({
  users: [
    {
      id: generateId(),
      username: 'admin',
      password: 'admin123',
      role: UserRole.ADMIN,
      name: '家庭管理员',
      createdAt: getCurrentTime(),
      isActive: true,
    },
  ],
  categories: defaultCategories,
  accounts: defaultAccounts,
  transactions: [],
  assets: [],
  liabilities: [],
  budgets: [],
  logs: [],
  notifications: [],
});

export const storage = {
  getData(): AppData {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    const initialData = getInitialData();
    this.setData(initialData);
    return initialData;
  },

  setData(data: AppData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  getAuth(): { isAuthenticated: boolean; user: User | null } {
    const auth = localStorage.getItem(AUTH_KEY);
    if (auth) {
      return JSON.parse(auth);
    }
    return { isAuthenticated: false, user: null };
  },

  setAuth(auth: { isAuthenticated: boolean; user: User | null }): void {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  },

  clearAuth(): void {
    localStorage.removeItem(AUTH_KEY);
  },

  getUsers(): User[] {
    return this.getData().users.map((user) => ({
      ...user,
      password: '',
    }));
  },

  getUserById(id: string): User | undefined {
    const user = this.getData().users.find((u) => u.id === id);
    if (user) {
      return { ...user, password: '' };
    }
    return undefined;
  },

  getUserByIdWithPassword(id: string): User | undefined {
    return this.getData().users.find((u) => u.id === id);
  },

  getUserByUsername(username: string): User | undefined {
    const user = this.getData().users.find((u) => u.username === username);
    if (user) {
      return { ...user, password: '' };
    }
    return undefined;
  },

  getUserByUsernameWithPassword(username: string): User | undefined {
    return this.getData().users.find((u) => u.username === username);
  },

  addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const data = this.getData();
    const newUser: User = {
      ...user,
      id: generateId(),
      createdAt: getCurrentTime(),
    };
    data.users.push(newUser);
    this.setData(data);
    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): User | null {
    const data = this.getData();
    const index = data.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    data.users[index] = { ...data.users[index], ...updates };
    this.setData(data);
    return { ...data.users[index], password: '' };
  },

  getSafeDataForExport(): AppData {
    const data = this.getData();
    return {
      ...data,
      users: data.users.map((user) => ({
        ...user,
        password: '',
      })),
    };
  },

  deleteUser(id: string): boolean {
    const data = this.getData();
    const index = data.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    data.users.splice(index, 1);
    this.setData(data);
    return true;
  },

  getCategories(): Category[] {
    return this.getData().categories;
  },

  getCategoryById(id: string): Category | undefined {
    return this.getData().categories.find((c) => c.id === id);
  },

  getCategoriesByType(type: 'income' | 'expense'): Category[] {
    return this.getData().categories.filter((c) => c.type === type);
  },

  addCategory(category: Omit<Category, 'id' | 'createdAt' | 'isSystem'>): Category {
    const data = this.getData();
    const newCategory: Category = {
      ...category,
      id: generateId(),
      createdAt: getCurrentTime(),
      isSystem: false,
    };
    data.categories.push(newCategory);
    this.setData(data);
    return newCategory;
  },

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const data = this.getData();
    const index = data.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    data.categories[index] = { ...data.categories[index], ...updates };
    this.setData(data);
    return data.categories[index];
  },

  deleteCategory(id: string): boolean {
    const data = this.getData();
    const index = data.categories.findIndex((c) => c.id === id && !c.isSystem);
    if (index === -1) return false;
    data.categories.splice(index, 1);
    this.setData(data);
    return true;
  },

  getAccounts(): Account[] {
    return this.getData().accounts;
  },

  getAccountById(id: string): Account | undefined {
    return this.getData().accounts.find((a) => a.id === id);
  },

  addAccount(account: Omit<Account, 'id' | 'createdAt'>): Account {
    const data = this.getData();
    const newAccount: Account = {
      ...account,
      id: generateId(),
      createdAt: getCurrentTime(),
    };
    data.accounts.push(newAccount);
    this.setData(data);
    return newAccount;
  },

  updateAccount(id: string, updates: Partial<Account>): Account | null {
    const data = this.getData();
    const index = data.accounts.findIndex((a) => a.id === id);
    if (index === -1) return null;
    data.accounts[index] = { ...data.accounts[index], ...updates };
    this.setData(data);
    return data.accounts[index];
  },

  deleteAccount(id: string): boolean {
    const data = this.getData();
    const index = data.accounts.findIndex((a) => a.id === id);
    if (index === -1) return false;
    data.accounts.splice(index, 1);
    this.setData(data);
    return true;
  },

  updateAccountBalance(accountId: string, amount: number): void {
    const data = this.getData();
    const index = data.accounts.findIndex((a) => a.id === accountId);
    if (index !== -1) {
      data.accounts[index].balance += amount;
      this.setData(data);
    }
  },

  getTransactions(): Transaction[] {
    return this.getData().transactions;
  },

  getTransactionById(id: string): Transaction | undefined {
    return this.getData().transactions.find((t) => t.id === id);
  },

  addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const data = this.getData();
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: getCurrentTime(),
    };
    data.transactions.unshift(newTransaction);
    this.setData(data);
    return newTransaction;
  },

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
    const data = this.getData();
    const index = data.transactions.findIndex((t) => t.id === id);
    if (index === -1) return null;
    data.transactions[index] = { ...data.transactions[index], ...updates };
    this.setData(data);
    return data.transactions[index];
  },

  deleteTransaction(id: string): boolean {
    const data = this.getData();
    const index = data.transactions.findIndex((t) => t.id === id);
    if (index === -1) return false;
    data.transactions.splice(index, 1);
    this.setData(data);
    return true;
  },

  getAssets(): Asset[] {
    return this.getData().assets;
  },

  getAssetById(id: string): Asset | undefined {
    return this.getData().assets.find((a) => a.id === id);
  },

  addAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Asset {
    const data = this.getData();
    const now = getCurrentTime();
    const newAsset: Asset = {
      ...asset,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    data.assets.push(newAsset);
    this.setData(data);
    return newAsset;
  },

  updateAsset(id: string, updates: Partial<Asset>): Asset | null {
    const data = this.getData();
    const index = data.assets.findIndex((a) => a.id === id);
    if (index === -1) return null;
    data.assets[index] = { ...data.assets[index], ...updates, updatedAt: getCurrentTime() };
    this.setData(data);
    return data.assets[index];
  },

  deleteAsset(id: string): boolean {
    const data = this.getData();
    const index = data.assets.findIndex((a) => a.id === id);
    if (index === -1) return false;
    data.assets.splice(index, 1);
    this.setData(data);
    return true;
  },

  getLiabilities(): Liability[] {
    return this.getData().liabilities;
  },

  getLiabilityById(id: string): Liability | undefined {
    return this.getData().liabilities.find((l) => l.id === id);
  },

  addLiability(liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>): Liability {
    const data = this.getData();
    const now = getCurrentTime();
    const newLiability: Liability = {
      ...liability,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    data.liabilities.push(newLiability);
    this.setData(data);
    return newLiability;
  },

  updateLiability(id: string, updates: Partial<Liability>): Liability | null {
    const data = this.getData();
    const index = data.liabilities.findIndex((l) => l.id === id);
    if (index === -1) return null;
    data.liabilities[index] = { ...data.liabilities[index], ...updates, updatedAt: getCurrentTime() };
    this.setData(data);
    return data.liabilities[index];
  },

  deleteLiability(id: string): boolean {
    const data = this.getData();
    const index = data.liabilities.findIndex((l) => l.id === id);
    if (index === -1) return false;
    data.liabilities.splice(index, 1);
    this.setData(data);
    return true;
  },

  getBudgets(): Budget[] {
    return this.getData().budgets;
  },

  getBudgetById(id: string): Budget | undefined {
    return this.getData().budgets.find((b) => b.id === id);
  },

  addBudget(budget: Omit<Budget, 'id' | 'createdAt'>): Budget {
    const data = this.getData();
    const newBudget: Budget = {
      ...budget,
      id: generateId(),
      createdAt: getCurrentTime(),
    };
    data.budgets.push(newBudget);
    this.setData(data);
    return newBudget;
  },

  updateBudget(id: string, updates: Partial<Budget>): Budget | null {
    const data = this.getData();
    const index = data.budgets.findIndex((b) => b.id === id);
    if (index === -1) return null;
    data.budgets[index] = { ...data.budgets[index], ...updates };
    this.setData(data);
    return data.budgets[index];
  },

  deleteBudget(id: string): boolean {
    const data = this.getData();
    const index = data.budgets.findIndex((b) => b.id === id);
    if (index === -1) return false;
    data.budgets.splice(index, 1);
    this.setData(data);
    return true;
  },

  addLog(log: Omit<OperationLog, 'id' | 'createdAt'>): OperationLog {
    const data = this.getData();
    const newLog: OperationLog = {
      ...log,
      id: generateId(),
      createdAt: getCurrentTime(),
    };
    data.logs.unshift(newLog);
    this.setData(data);
    return newLog;
  },

  getLogs(): OperationLog[] {
    return this.getData().logs;
  },

  addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification {
    const data = this.getData();
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      createdAt: getCurrentTime(),
      isRead: false,
    };
    data.notifications.unshift(newNotification);
    this.setData(data);
    return newNotification;
  },

  getNotifications(): Notification[] {
    return this.getData().notifications;
  },

  markNotificationRead(id: string): boolean {
    const data = this.getData();
    const index = data.notifications.findIndex((n) => n.id === id);
    if (index === -1) return false;
    data.notifications[index].isRead = true;
    this.setData(data);
    return true;
  },

  markAllNotificationsRead(): void {
    const data = this.getData();
    data.notifications.forEach((n) => (n.isRead = true));
    this.setData(data);
  },

  getTotalAssets(): number {
    return this.getAssets().reduce((sum, asset) => sum + asset.value, 0);
  },

  getTotalLiabilities(): number {
    return this.getLiabilities().reduce((sum, liability) => sum + liability.remainingAmount, 0);
  },

  getNetWorth(): number {
    return this.getTotalAssets() - this.getTotalLiabilities();
  },

  getAccountTotalBalance(): number {
    return this.getAccounts().reduce((sum, account) => sum + account.balance, 0);
  },
};

export { generateId, getCurrentTime };
