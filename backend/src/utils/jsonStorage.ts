import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');

export class JsonStorage {
  private dataDir: string;

  constructor() {
    this.dataDir = DATA_DIR;
    this.ensureDataDir();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  read<T>(fileName: string): T[] {
    const filePath = path.join(this.dataDir, `${fileName}.json`);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T[];
  }

  write<T>(fileName: string, data: T[]): void {
    const filePath = path.join(this.dataDir, `${fileName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  getById<T extends { id: string }>(fileName: string, id: string): T | undefined {
    const items = this.read<T>(fileName);
    return items.find(item => item.id === id);
  }

  create<T extends { id: string }>(fileName: string, item: T): T {
    const items = this.read<T>(fileName);
    items.push(item);
    this.write(fileName, items);
    return item;
  }

  update<T extends { id: string }>(fileName: string, id: string, updates: Partial<T>): T | undefined {
    const items = this.read<T>(fileName);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return undefined;
    items[index] = { ...items[index], ...updates };
    this.write(fileName, items);
    return items[index];
  }

  delete(fileName: string, id: string): boolean {
    const items = this.read<any>(fileName);
    const index = items.findIndex((item: any) => item.id === id);
    if (index === -1) return false;
    items.splice(index, 1);
    this.write(fileName, items);
    return true;
  }
}

export const storage = new JsonStorage();
