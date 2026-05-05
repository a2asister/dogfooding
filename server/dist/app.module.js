"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const dashboard_controller_1 = require("./controllers/dashboard.controller");
const config_controller_1 = require("./controllers/config.controller");
const chaos_controller_1 = require("./controllers/chaos.controller");
const json_database_service_1 = require("./services/json-database.service");
const circuit_breaker_service_1 = require("./services/circuit-breaker.service");
const rate_limiter_service_1 = require("./services/rate-limiter.service");
const isolation_service_1 = require("./services/isolation.service");
const chaos_monkey_service_1 = require("./services/chaos-monkey.service");
const test_controller_1 = require("./controllers/test.controller");
let AppModule = class AppModule {
    constructor(circuitBreakerService, rateLimiterService, isolationService) {
        this.circuitBreakerService = circuitBreakerService;
        this.rateLimiterService = rateLimiterService;
        this.isolationService = isolationService;
    }
    async onModuleInit() {
        await this.circuitBreakerService.initializeCircuits();
        await this.rateLimiterService.initializeRules();
        await this.isolationService.initializeIsolations();
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            dashboard_controller_1.DashboardController,
            config_controller_1.ConfigController,
            chaos_controller_1.ChaosController,
            test_controller_1.TestController,
        ],
        providers: [
            json_database_service_1.JsonDatabaseService,
            circuit_breaker_service_1.CircuitBreakerService,
            rate_limiter_service_1.RateLimiterService,
            isolation_service_1.IsolationService,
            chaos_monkey_service_1.ChaosMonkeyService,
        ],
    }),
    __metadata("design:paramtypes", [circuit_breaker_service_1.CircuitBreakerService,
        rate_limiter_service_1.RateLimiterService,
        isolation_service_1.IsolationService])
], AppModule);
//# sourceMappingURL=app.module.js.map