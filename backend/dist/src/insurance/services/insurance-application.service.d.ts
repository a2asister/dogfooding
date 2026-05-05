import { DataService } from './data.service';
import { InsuranceApplication } from '../interfaces/insurance.interface';
export declare class InsuranceApplicationService {
    private readonly dataService;
    private readonly fileName;
    constructor(dataService: DataService);
    findAll(): InsuranceApplication[];
    findOne(id: string): InsuranceApplication | undefined;
    create(application: Omit<InsuranceApplication, 'id' | 'createdAt' | 'updatedAt'>): InsuranceApplication;
    update(id: string, application: Partial<InsuranceApplication>): InsuranceApplication | undefined;
    remove(id: string): boolean;
}
