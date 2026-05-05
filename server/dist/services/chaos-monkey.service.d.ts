import { OnModuleInit } from '@nestjs/common';
import { JsonDatabaseService } from './json-database.service';
import { ChaosExperiment } from '../types';
export declare class ChaosMonkeyService implements OnModuleInit {
    private readonly dbService;
    private activeExperiments;
    constructor(dbService: JsonDatabaseService);
    onModuleInit(): Promise<void>;
    startExperiment(experimentId: string): Promise<ChaosExperiment | null>;
    stopExperiment(experimentId: string): Promise<ChaosExperiment | null>;
    pauseExperiment(experimentId: string): Promise<ChaosExperiment | null>;
    resumeExperiment(experimentId: string): Promise<ChaosExperiment | null>;
    applyChaos(endpoint: string, method: string): Promise<ChaosEffect | null>;
    private matchEndpoint;
    private createChaosEffect;
    getActiveExperiments(): Promise<ChaosExperiment[]>;
    getExperimentById(id: string): Promise<ChaosExperiment | undefined>;
    getAllExperiments(): Promise<ChaosExperiment[]>;
}
export interface ChaosEffect {
    type: 'latency' | 'exception' | 'abort' | 'cpu_stress' | 'memory_stress' | 'none';
    delay?: number;
    error?: Error;
    statusCode?: number;
    duration?: number;
    size?: number;
}
