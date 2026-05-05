import { InsuredPersonService } from '../services/insured-person.service';
import { InsuredPerson } from '../interfaces/insurance.interface';
export declare class InsuredPersonController {
    private readonly insuredPersonService;
    constructor(insuredPersonService: InsuredPersonService);
    findAll(): InsuredPerson[];
    findOne(id: string): InsuredPerson;
    create(person: Omit<InsuredPerson, 'id' | 'createdAt' | 'updatedAt'>): InsuredPerson;
    update(id: string, person: Partial<InsuredPerson>): InsuredPerson;
    remove(id: string): {
        success: boolean;
    };
}
