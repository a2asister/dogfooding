import { Injectable } from '@nestjs/common';
import { DataService } from './data.service';
import { ActuarialData } from '../interfaces/insurance.interface';

@Injectable()
export class ActuarialService {
  private readonly fileName = 'actuarial-data.json';

  constructor(private readonly dataService: DataService) {}

  findAll(): ActuarialData[] {
    return this.dataService.readData<ActuarialData>(this.fileName);
  }

  findOne(id: string): ActuarialData | undefined {
    const data = this.findAll();
    return data.find(item => item.id === id);
  }

  findByProductId(productId: string): ActuarialData[] {
    const data = this.findAll();
    return data.filter(item => item.productId === productId);
  }

  create(data: Omit<ActuarialData, 'id' | 'createdAt' | 'updatedAt'>): ActuarialData {
    const allData = this.findAll();
    const newId = this.dataService.generateId('AD', allData.map(d => d.id));
    const now = new Date().toISOString();
    
    const newData: ActuarialData = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    
    allData.push(newData);
    this.dataService.writeData(this.fileName, allData);
    
    return newData;
  }

  update(id: string, data: Partial<ActuarialData>): ActuarialData | undefined {
    const allData = this.findAll();
    const index = allData.findIndex(d => d.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    const now = new Date().toISOString();
    allData[index] = {
      ...allData[index],
      ...data,
      id: allData[index].id,
      updatedAt: now,
    };
    
    this.dataService.writeData(this.fileName, allData);
    return allData[index];
  }

  remove(id: string): boolean {
    const allData = this.findAll();
    const index = allData.findIndex(d => d.id === id);
    
    if (index === -1) {
      return false;
    }
    
    allData.splice(index, 1);
    this.dataService.writeData(this.fileName, allData);
    return true;
  }
}
