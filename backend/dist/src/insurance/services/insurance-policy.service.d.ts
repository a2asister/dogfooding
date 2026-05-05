import { DataService } from './data.service';
import { InsurancePolicy } from '../interfaces/insurance.interface';
export declare class InsurancePolicyService {
    private readonly dataService;
    private readonly fileName;
    constructor(dataService: DataService);
    findAll(): InsurancePolicy[];
    findOne(id: string): InsurancePolicy | undefined;
    findByPolicyNumber(policyNumber: string): InsurancePolicy | undefined;
    create(policy: Omit<InsurancePolicy, 'id' | 'createdAt' | 'updatedAt'>): InsurancePolicy;
    update(id: string, policy: Partial<InsurancePolicy>): InsurancePolicy | undefined;
    remove(id: string): boolean;
}
