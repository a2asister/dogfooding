import { Injectable } from '@nestjs/common';
import { DataService } from './data.service';
import { InsuranceApplication } from '../interfaces/insurance.interface';

@Injectable()
export class InsuranceApplicationService {
  private readonly fileName = 'insurance-applications.json';

  constructor(private readonly dataService: DataService) {}

  findAll(): InsuranceApplication[] {
    return this.dataService.readData<InsuranceApplication>(this.fileName);
  }

  findOne(id: string): InsuranceApplication | undefined {
    const applications = this.findAll();
    return applications.find(application => application.id === id);
  }

  create(application: Omit<InsuranceApplication, 'id' | 'createdAt' | 'updatedAt'>): InsuranceApplication {
    const applications = this.findAll();
    const newId = this.dataService.generateId('IA', applications.map(a => a.id));
    const now = new Date().toISOString();
    
    const newApplication: InsuranceApplication = {
      ...application,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    
    applications.push(newApplication);
    this.dataService.writeData(this.fileName, applications);
    
    return newApplication;
  }

  update(id: string, application: Partial<InsuranceApplication>): InsuranceApplication | undefined {
    const applications = this.findAll();
    const index = applications.findIndex(a => a.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    const now = new Date().toISOString();
    applications[index] = {
      ...applications[index],
      ...application,
      id: applications[index].id,
      updatedAt: now,
    };
    
    this.dataService.writeData(this.fileName, applications);
    return applications[index];
  }

  remove(id: string): boolean {
    const applications = this.findAll();
    const index = applications.findIndex(a => a.id === id);
    
    if (index === -1) {
      return false;
    }
    
    applications.splice(index, 1);
    this.dataService.writeData(this.fileName, applications);
    return true;
  }
}
