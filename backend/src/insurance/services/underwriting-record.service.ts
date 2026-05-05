import { Injectable } from '@nestjs/common';
import { DataService } from './data.service';
import { UnderwritingRecord } from '../interfaces/insurance.interface';

@Injectable()
export class UnderwritingRecordService {
  private readonly fileName = 'underwriting-records.json';

  constructor(private readonly dataService: DataService) {}

  findAll(): UnderwritingRecord[] {
    return this.dataService.readData<UnderwritingRecord>(this.fileName);
  }

  findOne(id: string): UnderwritingRecord | undefined {
    const records = this.findAll();
    return records.find(record => record.id === id);
  }

  findByApplicationId(applicationId: string): UnderwritingRecord[] {
    const records = this.findAll();
    return records.filter(record => record.applicationId === applicationId);
  }

  create(record: Omit<UnderwritingRecord, 'id' | 'createdAt' | 'updatedAt'>): UnderwritingRecord {
    const records = this.findAll();
    const newId = this.dataService.generateId('UR', records.map(r => r.id));
    const now = new Date().toISOString();
    
    const newRecord: UnderwritingRecord = {
      ...record,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    
    records.push(newRecord);
    this.dataService.writeData(this.fileName, records);
    
    return newRecord;
  }

  update(id: string, record: Partial<UnderwritingRecord>): UnderwritingRecord | undefined {
    const records = this.findAll();
    const index = records.findIndex(r => r.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    const now = new Date().toISOString();
    records[index] = {
      ...records[index],
      ...record,
      id: records[index].id,
      updatedAt: now,
    };
    
    this.dataService.writeData(this.fileName, records);
    return records[index];
  }

  remove(id: string): boolean {
    const records = this.findAll();
    const index = records.findIndex(r => r.id === id);
    
    if (index === -1) {
      return false;
    }
    
    records.splice(index, 1);
    this.dataService.writeData(this.fileName, records);
    return true;
  }
}
