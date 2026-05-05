import { DataService } from './data.service';
import { AntiFraudRecord } from '../interfaces/insurance.interface';
export declare class AntiFraudService {
    private readonly dataService;
    private readonly fileName;
    constructor(dataService: DataService);
    findAll(): AntiFraudRecord[];
    findOne(id: string): AntiFraudRecord | undefined;
    findByRelatedId(relatedId: string): AntiFraudRecord[];
    create(record: Omit<AntiFraudRecord, 'id' | 'createdAt' | 'updatedAt'>): AntiFraudRecord;
    update(id: string, record: Partial<AntiFraudRecord>): AntiFraudRecord | undefined;
    remove(id: string): boolean;
}
