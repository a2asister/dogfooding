import { DataService } from './data.service';
import { ActuarialData } from '../interfaces/insurance.interface';
export declare class ActuarialService {
    private readonly dataService;
    private readonly fileName;
    constructor(dataService: DataService);
    findAll(): ActuarialData[];
    findOne(id: string): ActuarialData | undefined;
    findByProductId(productId: string): ActuarialData[];
    create(data: Omit<ActuarialData, 'id' | 'createdAt' | 'updatedAt'>): ActuarialData;
    update(id: string, data: Partial<ActuarialData>): ActuarialData | undefined;
    remove(id: string): boolean;
}
