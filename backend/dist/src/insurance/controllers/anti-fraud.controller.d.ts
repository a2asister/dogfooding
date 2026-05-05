import { AntiFraudService } from '../services/anti-fraud.service';
import { AntiFraudRecord } from '../interfaces/insurance.interface';
export declare class AntiFraudController {
    private readonly antiFraudService;
    constructor(antiFraudService: AntiFraudService);
    findAll(relatedId?: string): AntiFraudRecord[];
    findOne(id: string): AntiFraudRecord;
    create(record: Omit<AntiFraudRecord, 'id' | 'createdAt' | 'updatedAt'>): AntiFraudRecord;
    update(id: string, record: Partial<AntiFraudRecord>): AntiFraudRecord;
    remove(id: string): {
        success: boolean;
    };
}
