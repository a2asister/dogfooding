import { JsonDatabaseService } from './json-database.service';
import { CircuitBreakerConfig, CircuitBreakerState } from '../types';
export declare class CircuitBreakerService {
    private readonly dbService;
    private circuits;
    constructor(dbService: JsonDatabaseService);
    initializeCircuits(): Promise<void>;
    execute<T>(circuitId: string, supplier: () => Promise<T>, fallback?: () => Promise<T>): Promise<T>;
    private acquirePermission;
    private recordCall;
    private updateFailureRates;
    private checkThresholds;
    private transitionTo;
    private calculateMetrics;
    resetCircuit(circuitId: string): Promise<void>;
    forceOpen(circuitId: string): Promise<void>;
    forceClosed(circuitId: string): Promise<void>;
    getCircuitState(circuitId: string): Promise<CircuitBreakerState | null>;
    getAllCircuitStates(): Promise<{
        config: CircuitBreakerConfig;
        state: CircuitBreakerState;
    }[]>;
}
