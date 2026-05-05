import { UnderwritingRecordService } from '../services/underwriting-record.service';
import { UnderwritingRecord } from '../interfaces/insurance.interface';
export declare class UnderwritingRecordController {
    private readonly underwritingRecordService;
    constructor(underwritingRecordService: UnderwritingRecordService);
    findAll(applicationId?: string): UnderwritingRecord[];
    findOne(id: string): UnderwritingRecord;
    create(record: Omit<UnderwritingRecord, 'id' | 'createdAt' | 'updatedAt'>): UnderwritingRecord;
    update(id: string, record: Partial<UnderwritingRecord>): UnderwritingRecord;
    remove(id: string): {
        success: boolean;
    };
}
