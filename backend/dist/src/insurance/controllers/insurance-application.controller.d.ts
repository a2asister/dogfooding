import { InsuranceApplicationService } from '../services/insurance-application.service';
import { InsuranceApplication } from '../interfaces/insurance.interface';
export declare class InsuranceApplicationController {
    private readonly insuranceApplicationService;
    constructor(insuranceApplicationService: InsuranceApplicationService);
    findAll(): InsuranceApplication[];
    findOne(id: string): InsuranceApplication;
    create(application: Omit<InsuranceApplication, 'id' | 'createdAt' | 'updatedAt'>): InsuranceApplication;
    update(id: string, application: Partial<InsuranceApplication>): InsuranceApplication;
    remove(id: string): {
        success: boolean;
    };
}
