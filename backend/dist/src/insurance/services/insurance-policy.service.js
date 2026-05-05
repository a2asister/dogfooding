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
exports.InsurancePolicyService = void 0;
const common_1 = require("@nestjs/common");
const data_service_1 = require("./data.service");
let InsurancePolicyService = class InsurancePolicyService {
    constructor(dataService) {
        this.dataService = dataService;
        this.fileName = 'insurance-policies.json';
    }
    findAll() {
        return this.dataService.readData(this.fileName);
    }
    findOne(id) {
        const policies = this.findAll();
        return policies.find(policy => policy.id === id);
    }
    findByPolicyNumber(policyNumber) {
        const policies = this.findAll();
        return policies.find(policy => policy.policyNumber === policyNumber);
    }
    create(policy) {
        const policies = this.findAll();
        const newId = this.dataService.generateId('POL', policies.map(p => p.id));
        const now = new Date().toISOString();
        const newPolicy = {
            ...policy,
            id: newId,
            createdAt: now,
            updatedAt: now,
        };
        policies.push(newPolicy);
        this.dataService.writeData(this.fileName, policies);
        return newPolicy;
    }
    update(id, policy) {
        const policies = this.findAll();
        const index = policies.findIndex(p => p.id === id);
        if (index === -1) {
            return undefined;
        }
        const now = new Date().toISOString();
        policies[index] = {
            ...policies[index],
            ...policy,
            id: policies[index].id,
            updatedAt: now,
        };
        this.dataService.writeData(this.fileName, policies);
        return policies[index];
    }
    remove(id) {
        const policies = this.findAll();
        const index = policies.findIndex(p => p.id === id);
        if (index === -1) {
            return false;
        }
        policies.splice(index, 1);
        this.dataService.writeData(this.fileName, policies);
        return true;
    }
};
exports.InsurancePolicyService = InsurancePolicyService;
exports.InsurancePolicyService = InsurancePolicyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_service_1.DataService])
], InsurancePolicyService);
//# sourceMappingURL=insurance-policy.service.js.map