import { ActuarialService } from '../services/actuarial.service';
import { ActuarialData } from '../interfaces/insurance.interface';
export declare class ActuarialController {
    private readonly actuarialService;
    constructor(actuarialService: ActuarialService);
    findAll(productId?: string): ActuarialData[];
    findOne(id: string): ActuarialData;
    create(data: Omit<ActuarialData, 'id' | 'createdAt' | 'updatedAt'>): ActuarialData;
    update(id: string, data: Partial<ActuarialData>): ActuarialData;
    remove(id: string): {
        success: boolean;
    };
}
