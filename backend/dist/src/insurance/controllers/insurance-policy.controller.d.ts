import { InsurancePolicyService } from '../services/insurance-policy.service';
import { InsurancePolicy } from '../interfaces/insurance.interface';
export declare class InsurancePolicyController {
    private readonly insurancePolicyService;
    constructor(insurancePolicyService: InsurancePolicyService);
    findAll(policyNumber?: string): InsurancePolicy[];
    findOne(id: string): InsurancePolicy;
    create(policy: Omit<InsurancePolicy, 'id' | 'createdAt' | 'updatedAt'>): InsurancePolicy;
    update(id: string, policy: Partial<InsurancePolicy>): InsurancePolicy;
    remove(id: string): {
        success: boolean;
    };
}
