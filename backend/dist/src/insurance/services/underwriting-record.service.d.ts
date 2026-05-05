import { DataService } from './data.service';
import { UnderwritingRecord } from '../interfaces/insurance.interface';
export declare class UnderwritingRecordService {
    private readonly dataService;
    private readonly fileName;
    constructor(dataService: DataService);
    findAll(): UnderwritingRecord[];
    findOne(id: string): UnderwritingRecord | undefined;
    findByApplicationId(applicationId: string): UnderwritingRecord[];
    create(record: Omit<UnderwritingRecord, 'id' | 'createdAt' | 'updatedAt'>): UnderwritingRecord;
    update(id: string, record: Partial<UnderwritingRecord>): UnderwritingRecord | undefined;
    remove(id: string): boolean;
}
