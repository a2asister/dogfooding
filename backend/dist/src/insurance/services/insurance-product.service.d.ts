import { DataService } from './data.service';
import { InsuranceProduct } from '../interfaces/insurance.interface';
export declare class InsuranceProductService {
    private readonly dataService;
    private readonly fileName;
    constructor(dataService: DataService);
    findAll(): InsuranceProduct[];
    findOne(id: string): InsuranceProduct | undefined;
    create(product: Omit<InsuranceProduct, 'id' | 'createdAt' | 'updatedAt'>): InsuranceProduct;
    update(id: string, product: Partial<InsuranceProduct>): InsuranceProduct | undefined;
    remove(id: string): boolean;
}
