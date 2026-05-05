import { JsonDatabaseService } from '../services/json-database.service';
import { ChaosMonkeyService } from '../services/chaos-monkey.service';
import { ChaosExperiment, ChaosType } from '../types';
export declare class ChaosController {
    private readonly dbService;
    private readonly chaosService;
    constructor(dbService: JsonDatabaseService, chaosService: ChaosMonkeyService);
    getAllExperiments(): Promise<ChaosExperiment[]>;
    getExperiment(id: string): Promise<ChaosExperiment>;
    createExperiment(body: any): Promise<ChaosExperiment>;
    updateExperiment(id: string, body: Partial<ChaosExperiment>): Promise<ChaosExperiment>;
    deleteExperiment(id: string): Promise<{
        success: boolean;
    }>;
    startExperiment(id: string): Promise<{
        success: boolean;
        message: string;
        experiment: ChaosExperiment;
    } | {
        success: boolean;
        experiment: ChaosExperiment;
        message?: undefined;
    }>;
    stopExperiment(id: string): Promise<{
        success: boolean;
        experiment: ChaosExperiment;
    }>;
    pauseExperiment(id: string): Promise<{
        success: boolean;
        experiment: ChaosExperiment;
    }>;
    resumeExperiment(id: string): Promise<{
        success: boolean;
        experiment: ChaosExperiment;
    }>;
    getActiveExperiments(): Promise<ChaosExperiment[]>;
    getChaosTypes(): ChaosType[];
}
