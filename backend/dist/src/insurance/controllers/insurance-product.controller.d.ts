import { InsuranceProductService } from '../services/insurance-product.service';
import { InsuranceProduct } from '../interfaces/insurance.interface';
export declare class InsuranceProductController {
    private readonly insuranceProductService;
    constructor(insuranceProductService: InsuranceProductService);
    findAll(): InsuranceProduct[];
    findOne(id: string): InsuranceProduct;
    create(product: Omit<InsuranceProduct, 'id' | 'createdAt' | 'updatedAt'>): InsuranceProduct;
    update(id: string, product: Partial<InsuranceProduct>): InsuranceProduct;
    remove(id: string): {
        success: boolean;
    };
}
