import { Injectable } from '@nestjs/common';
import { DataService } from './data.service';
import { ClaimApplication } from '../interfaces/insurance.interface';

@Injectable()
export class ClaimApplicationService {
  private readonly fileName = 'claim-applications.json';

  constructor(private readonly dataService: DataService) {}

  findAll(): ClaimApplication[] {
    return this.dataService.readData<ClaimApplication>(this.fileName);
  }

  findOne(id: string): ClaimApplication | undefined {
    const claims = this.findAll();
    return claims.find(claim => claim.id === id);
  }

  findByPolicyId(policyId: string): ClaimApplication[] {
    const claims = this.findAll();
    return claims.filter(claim => claim.policyId === policyId);
  }

  create(claim: Omit<ClaimApplication, 'id' | 'createdAt' | 'updatedAt'>): ClaimApplication {
    const claims = this.findAll();
    const newId = this.dataService.generateId('CL', claims.map(c => c.id));
    const now = new Date().toISOString();
    
    const newClaim: ClaimApplication = {
      ...claim,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    
    claims.push(newClaim);
    this.dataService.writeData(this.fileName, claims);
    
    return newClaim;
  }

  update(id: string, claim: Partial<ClaimApplication>): ClaimApplication | undefined {
    const claims = this.findAll();
    const index = claims.findIndex(c => c.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    const now = new Date().toISOString();
    claims[index] = {
      ...claims[index],
      ...claim,
      id: claims[index].id,
      updatedAt: now,
    };
    
    this.dataService.writeData(this.fileName, claims);
    return claims[index];
  }

  remove(id: string): boolean {
    const claims = this.findAll();
    const index = claims.findIndex(c => c.id === id);
    
    if (index === -1) {
      return false;
    }
    
    claims.splice(index, 1);
    this.dataService.writeData(this.fileName, claims);
    return true;
  }
}
