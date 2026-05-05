import { ClaimApplicationService } from '../services/claim-application.service';
import { ClaimApplication } from '../interfaces/insurance.interface';
export declare class ClaimApplicationController {
    private readonly claimApplicationService;
    constructor(claimApplicationService: ClaimApplicationService);
    findAll(policyId?: string): ClaimApplication[];
    findOne(id: string): ClaimApplication;
    create(claim: Omit<ClaimApplication, 'id' | 'createdAt' | 'updatedAt'>): ClaimApplication;
    update(id: string, claim: Partial<ClaimApplication>): ClaimApplication;
    remove(id: string): {
        success: boolean;
    };
}
