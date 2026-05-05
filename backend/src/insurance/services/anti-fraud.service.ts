import { Injectable } from '@nestjs/common';
import { DataService } from './data.service';
import { AntiFraudRecord } from '../interfaces/insurance.interface';

@Injectable()
export class AntiFraudService {
  private readonly fileName = 'anti-fraud-records.json';

  constructor(private readonly dataService: DataService) {}

  findAll(): AntiFraudRecord[] {
    return this.dataService.readData<AntiFraudRecord>(this.fileName);
  }

  findOne(id: string): AntiFraudRecord | undefined {
    const records = this.findAll();
    return records.find(record => record.id === id);
  }

  findByRelatedId(relatedId: string): AntiFraudRecord[] {
    const records = this.findAll();
    return records.filter(record => record.relatedId === relatedId);
  }

  create(record: Omit<AntiFraudRecord, 'id' | 'createdAt' | 'updatedAt'>): AntiFraudRecord {
    const records = this.findAll();
    const newId = this.dataService.generateId('AFR', records.map(r => r.id));
    const now = new Date().toISOString();
    
    const newRecord: AntiFraudRecord = {
      ...record,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    
    records.push(newRecord);
    this.dataService.writeData(this.fileName, records);
    
    return newRecord;
  }

  update(id: string, record: Partial<AntiFraudRecord>): AntiFraudRecord | undefined {
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
