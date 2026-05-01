import * as fs from 'fs';
import * as path from 'path';
import { Contract, PerformanceRecord, Archive, User } from '../types';

const DATA_DIR = path.join(__dirname, '../../data');

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const readJSON = <T>(filename: string, defaultData: T): T => {
  ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  if (fs.existsSync(filepath)) {
    const content = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(content);
  }
  return defaultData;
};

const writeJSON = <T>(filename: string, data: T): void => {
  ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
};

export class ContractStore {
  private static CONTRACT_FILE = 'contracts.json';
  private static PERFORMANCE_FILE = 'performance.json';
  private static ARCHIVE_FILE = 'archives.json';
  private static USER_FILE = 'users.json';

  static getAllContracts(): Contract[] {
    return readJSON<Contract[]>(this.CONTRACT_FILE, []);
  }

  static getContractById(id: string): Contract | undefined {
    const contracts = this.getAllContracts();
    return contracts.find(c => c.id === id);
  }

  static createContract(contract: Contract): Contract {
    const contracts = this.getAllContracts();
    contracts.push(contract);
    writeJSON(this.CONTRACT_FILE, contracts);
    return contract;
  }

  static updateContract(id: string, updates: Partial<Contract>): Contract | undefined {
    const contracts = this.getAllContracts();
    const index = contracts.findIndex(c => c.id === id);
    if (index !== -1) {
      contracts[index] = { ...contracts[index], ...updates, updatedAt: new Date().toISOString() };
      writeJSON(this.CONTRACT_FILE, contracts);
      return contracts[index];
    }
    return undefined;
  }

  static deleteContract(id: string): boolean {
    const contracts = this.getAllContracts();
    const index = contracts.findIndex(c => c.id === id);
    if (index !== -1) {
      contracts.splice(index, 1);
      writeJSON(this.CONTRACT_FILE, contracts);
      return true;
    }
    return false;
  }

  static getExpiringContracts(days: number = 30): Contract[] {
    const contracts = this.getAllContracts();
    const now = new Date();
    const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return contracts.filter(c => {
      const endDate = new Date(c.endDate);
      return c.status === 'performance' && endDate <= threshold && endDate >= now;
    });
  }

  static getAllPerformance(): PerformanceRecord[] {
    return readJSON<PerformanceRecord[]>(this.PERFORMANCE_FILE, []);
  }

  static getPerformanceByContractId(contractId: string): PerformanceRecord[] {
    const records = this.getAllPerformance();
    return records.filter(r => r.contractId === contractId);
  }

  static createPerformance(record: PerformanceRecord): PerformanceRecord {
    const records = this.getAllPerformance();
    records.push(record);
    writeJSON(this.PERFORMANCE_FILE, records);
    return record;
  }

  static updatePerformance(id: string, updates: Partial<PerformanceRecord>): PerformanceRecord | undefined {
    const records = this.getAllPerformance();
    const index = records.findIndex(r => r.id === id);
    if (index !== -1) {
      records[index] = { ...records[index], ...updates };
      writeJSON(this.PERFORMANCE_FILE, records);
      return records[index];
    }
    return undefined;
  }

  static getAllArchives(): Archive[] {
    return readJSON<Archive[]>(this.ARCHIVE_FILE, []);
  }

  static getArchiveById(id: string): Archive | undefined {
    const archives = this.getAllArchives();
    return archives.find(a => a.id === id);
  }

  static createArchive(archive: Archive): Archive {
    const archives = this.getAllArchives();
    archives.push(archive);
    writeJSON(this.ARCHIVE_FILE, archives);
    return archive;
  }

  static searchArchives(keyword: string): Archive[] {
    const archives = this.getAllArchives();
    const lowerKeyword = keyword.toLowerCase();
    return archives.filter(a => 
      a.keywords.some(k => k.toLowerCase().includes(lowerKeyword)) ||
      a.id.toLowerCase().includes(lowerKeyword)
    );
  }

  static getAllUsers(): User[] {
    return readJSON<User[]>(this.USER_FILE, [
      {
        id: 'user-1',
        name: '张经理',
        role: 'manager',
        email: 'zhang@company.com',
        department: '合同管理部'
      },
      {
        id: 'user-2',
        name: '李法务',
        role: 'legal',
        email: 'li@company.com',
        department: '法务部'
      },
      {
        id: 'user-3',
        name: '王员工',
        role: 'employee',
        email: 'wang@company.com',
        department: '业务部'
      },
      {
        id: 'user-4',
        name: '赵管理员',
        role: 'admin',
        email: 'zhao@company.com',
        department: '行政部'
      }
    ]);
  }
}
