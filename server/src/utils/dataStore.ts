import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, '../../../data');

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

interface Data {
  stores: Store[];
  customerFlows: CustomerFlow[];
  inventories: Inventory[];
  members: Member[];
  promotions: Promotion[];
  attendances: Attendance[];
  employees: Employee[];
}

const defaultData: Data = {
  stores: [],
  customerFlows: [],
  inventories: [],
  members: [],
  promotions: [],
  attendances: [],
  employees: []
};

class DataStore {
  private data: Data;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): Data {
    const dataPath = path.join(DATA_DIR, 'data.json');
    try {
      if (fs.existsSync(dataPath)) {
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(rawData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    return { ...defaultData };
  }

  private saveData(): void {
    const dataPath = path.join(DATA_DIR, 'data.json');
    try {
      fs.writeFileSync(dataPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Stores
  getStores(): Store[] {
    return this.data.stores;
  }

  getStoreById(id: string): Store | undefined {
    return this.data.stores.find(store => store.id === id);
  }

  addStore(store: Omit<Store, 'id' | 'createdAt'>): Store {
    const newStore: Store = {
      ...store,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    this.data.stores.push(newStore);
    this.saveData();
    return newStore;
  }

  updateStore(id: string, updates: Partial<Store>): Store | null {
    const index = this.data.stores.findIndex(store => store.id === id);
    if (index === -1) return null;
    this.data.stores[index] = { ...this.data.stores[index], ...updates };
    this.saveData();
    return this.data.stores[index];
  }

  deleteStore(id: string): boolean {
    const index = this.data.stores.findIndex(store => store.id === id);
    if (index === -1) return false;
    this.data.stores.splice(index, 1);
    this.saveData();
    return true;
  }

  // CustomerFlow
  getCustomerFlows(storeId?: string): CustomerFlow[] {
    let flows = this.data.customerFlows;
    if (storeId) {
      flows = flows.filter(flow => flow.storeId === storeId);
    }
    return flows;
  }

  addCustomerFlow(flow: Omit<CustomerFlow, 'id' | 'timestamp'>): CustomerFlow {
    const newFlow: CustomerFlow = {
      ...flow,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };
    this.data.customerFlows.push(newFlow);
    this.saveData();
    return newFlow;
  }

  // Inventory
  getInventories(storeId?: string): Inventory[] {
    let items = this.data.inventories;
    if (storeId) {
      items = items.filter(item => item.storeId === storeId);
    }
    return items;
  }

  addInventory(inventory: Omit<Inventory, 'id' | 'updatedAt'>): Inventory {
    const newItem: Inventory = {
      ...inventory,
      id: this.generateId(),
      updatedAt: new Date().toISOString()
    };
    this.data.inventories.push(newItem);
    this.saveData();
    return newItem;
  }

  updateInventory(id: string, updates: Partial<Inventory>): Inventory | null {
    const index = this.data.inventories.findIndex(item => item.id === id);
    if (index === -1) return null;
    this.data.inventories[index] = {
      ...this.data.inventories[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.inventories[index];
  }

  // Members
  getMembers(storeId?: string): Member[] {
    let members = this.data.members;
    if (storeId) {
      members = members.filter(member => member.storeId === storeId);
    }
    return members;
  }

  addMember(member: Omit<Member, 'id' | 'createdAt' | 'points' | 'totalSpent'>): Member {
    const newMember: Member = {
      ...member,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      points: 0,
      totalSpent: 0
    };
    this.data.members.push(newMember);
    this.saveData();
    return newMember;
  }

  updateMember(id: string, updates: Partial<Member>): Member | null {
    const index = this.data.members.findIndex(member => member.id === id);
    if (index === -1) return null;
    this.data.members[index] = { ...this.data.members[index], ...updates };
    this.saveData();
    return this.data.members[index];
  }

  // Promotions
  getPromotions(storeId?: string): Promotion[] {
    let promotions = this.data.promotions;
    if (storeId) {
      promotions = promotions.filter(promo => promo.storeId === storeId);
    }
    return promotions;
  }

  addPromotion(promotion: Omit<Promotion, 'id'>): Promotion {
    const newPromotion: Promotion = {
      ...promotion,
      id: this.generateId()
    };
    this.data.promotions.push(newPromotion);
    this.saveData();
    return newPromotion;
  }

  updatePromotion(id: string, updates: Partial<Promotion>): Promotion | null {
    const index = this.data.promotions.findIndex(promo => promo.id === id);
    if (index === -1) return null;
    this.data.promotions[index] = { ...this.data.promotions[index], ...updates };
    this.saveData();
    return this.data.promotions[index];
  }

  // Attendances
  getAttendances(storeId?: string): Attendance[] {
    let attendances = this.data.attendances;
    if (storeId) {
      attendances = attendances.filter(attendance => attendance.storeId === storeId);
    }
    return attendances;
  }

  addAttendance(attendance: Omit<Attendance, 'id'>): Attendance {
    const newAttendance: Attendance = {
      ...attendance,
      id: this.generateId()
    };
    this.data.attendances.push(newAttendance);
    this.saveData();
    return newAttendance;
  }

  updateAttendance(id: string, updates: Partial<Attendance>): Attendance | null {
    const index = this.data.attendances.findIndex(attendance => attendance.id === id);
    if (index === -1) return null;
    this.data.attendances[index] = { ...this.data.attendances[index], ...updates };
    this.saveData();
    return this.data.attendances[index];
  }

  // Employees
  getEmployees(storeId?: string): Employee[] {
    let employees = this.data.employees;
    if (storeId) {
      employees = employees.filter(employee => employee.storeId === storeId);
    }
    return employees;
  }

  addEmployee(employee: Omit<Employee, 'id' | 'createdAt'>): Employee {
    const newEmployee: Employee = {
      ...employee,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    this.data.employees.push(newEmployee);
    this.saveData();
    return newEmployee;
  }

  updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const index = this.data.employees.findIndex(employee => employee.id === id);
    if (index === -1) return null;
    this.data.employees[index] = { ...this.data.employees[index], ...updates };
    this.saveData();
    return this.data.employees[index];
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const dataStore = new DataStore();
