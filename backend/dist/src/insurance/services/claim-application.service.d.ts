import { DataService } from './data.service';
import { ClaimApplication } from '../interfaces/insurance.interface';
export declare class ClaimApplicationService {
    private readonly dataService;
    private readonly fileName;
    constructor(dataService: DataService);
    findAll(): ClaimApplication[];
    findOne(id: string): ClaimApplication | undefined;
    findByPolicyId(policyId: string): ClaimApplication[];
    create(claim: Omit<ClaimApplication, 'id' | 'createdAt' | 'updatedAt'>): ClaimApplication;
    update(id: string, claim: Partial<ClaimApplication>): ClaimApplication | undefined;
    remove(id: string): boolean;
}
