import { JsonDatabaseService } from './json-database.service';
import { IsolationConfig, IsolationState } from '../types';
export declare class IsolationService {
    private readonly dbService;
    private instances;
    constructor(dbService: JsonDatabaseService);
    initializeIsolations(): Promise<void>;
    acquire(configId: string): Promise<AcquireResult>;
    private release;
    private persistState;
    getIsolationState(configId: string): Promise<IsolationState | null>;
    getAllIsolationsWithStates(): Promise<{
        config: IsolationConfig;
        state: IsolationState;
    }[]>;
    resetIsolation(configId: string): Promise<void>;
}
export interface AcquireResult {
    acquired: boolean;
    release?: () => Promise<void>;
    reason?: 'timeout' | 'rejected' | 'capacity_exceeded';
}
