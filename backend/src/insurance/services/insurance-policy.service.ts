import { Injectable } from '@nestjs/common';
import { DataService } from './data.service';
import { InsurancePolicy } from '../interfaces/insurance.interface';

@Injectable()
export class InsurancePolicyService {
  private readonly fileName = 'insurance-policies.json';

  constructor(private readonly dataService: DataService) {}

  findAll(): InsurancePolicy[] {
    return this.dataService.readData<InsurancePolicy>(this.fileName);
  }

  findOne(id: string): InsurancePolicy | undefined {
    const policies = this.findAll();
    return policies.find(policy => policy.id === id);
  }

  findByPolicyNumber(policyNumber: string): InsurancePolicy | undefined {
    const policies = this.findAll();
    return policies.find(policy => policy.policyNumber === policyNumber);
  }

  create(policy: Omit<InsurancePolicy, 'id' | 'createdAt' | 'updatedAt'>): InsurancePolicy {
    const policies = this.findAll();
    const newId = this.dataService.generateId('POL', policies.map(p => p.id));
    const now = new Date().toISOString();
    
    const newPolicy: InsurancePolicy = {
      ...policy,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    
    policies.push(newPolicy);
    this.dataService.writeData(this.fileName, policies);
    
    return newPolicy;
  }

  update(id: string, policy: Partial<InsurancePolicy>): InsurancePolicy | undefined {
    const policies = this.findAll();
    const index = policies.findIndex(p => p.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    const now = new Date().toISOString();
    policies[index] = {
      ...policies[index],
      ...policy,
      id: policies[index].id,
      updatedAt: now,
    };
    
    this.dataService.writeData(this.fileName, policies);
    return policies[index];
  }

  remove(id: string): boolean {
    const policies = this.findAll();
    const index = policies.findIndex(p => p.id === id);
    
    if (index === -1) {
      return false;
    }
    
    policies.splice(index, 1);
    this.dataService.writeData(this.fileName, policies);
    return true;
  }
}
