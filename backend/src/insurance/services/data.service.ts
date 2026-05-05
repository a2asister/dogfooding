import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DataService {
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(__dirname, '../../../../data');
  }

  readData<T>(fileName: string): T[] {
    try {
      const filePath = path.join(this.dataDir, fileName);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data) as T[];
      }
      return [];
    } catch (error) {
      console.error(`Error reading data from ${fileName}:`, error);
      return [];
    }
  }

  writeData<T>(fileName: string, data: T[]): boolean {
    try {
      const filePath = path.join(this.dataDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error(`Error writing data to ${fileName}:`, error);
      return false;
    }
  }

  generateId(prefix: string, existingIds: string[]): string {
    let maxNum = 0;
    existingIds.forEach(id => {
      const match = id.match(new RegExp(`^${prefix}(\\d+)$`));
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    });
    return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
  }
}
