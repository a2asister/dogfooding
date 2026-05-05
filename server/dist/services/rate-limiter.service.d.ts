import { JsonDatabaseService } from './json-database.service';
import { RateLimitRule, RateLimitState } from '../types';
interface LimitCheckResult {
    allowed: boolean;
    currentLimit: number;
    remaining: number;
    resetTime: number;
}
export declare class RateLimiterService {
    private readonly dbService;
    private rules;
    private lastAdjustmentTime;
    constructor(dbService: JsonDatabaseService);
    initializeRules(): Promise<void>;
    checkRateLimit(endpoint: string, method: string, responseTime?: number): Promise<LimitCheckResult>;
    private findMatchingRule;
    private matchEndpoint;
    private consumeToken;
    private handleFixedWindow;
    private handleSlidingWindow;
    private handleTokenBucket;
    private handleLeakyBucket;
    private adjustLimitDynamically;
    getRuleState(ruleId: string): Promise<RateLimitState | null>;
    getAllRulesWithStates(): Promise<{
        rule: RateLimitRule;
        state: RateLimitState;
    }[]>;
    resetRule(ruleId: string): Promise<void>;
}
export {};
