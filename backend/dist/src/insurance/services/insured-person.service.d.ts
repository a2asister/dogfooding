import { DataService } from './data.service';
import { InsuredPerson } from '../interfaces/insurance.interface';
export declare class InsuredPersonService {
    private readonly dataService;
    private readonly fileName;
    constructor(dataService: DataService);
    findAll(): InsuredPerson[];
    findOne(id: string): InsuredPerson | undefined;
    create(person: Omit<InsuredPerson, 'id' | 'createdAt' | 'updatedAt'>): InsuredPerson;
    update(id: string, person: Partial<InsuredPerson>): InsuredPerson | undefined;
    remove(id: string): boolean;
}
