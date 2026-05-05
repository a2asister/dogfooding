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
exports.ClaimApplicationService = void 0;
const common_1 = require("@nestjs/common");
const data_service_1 = require("./data.service");
let ClaimApplicationService = class ClaimApplicationService {
    constructor(dataService) {
        this.dataService = dataService;
        this.fileName = 'claim-applications.json';
    }
    findAll() {
        return this.dataService.readData(this.fileName);
    }
    findOne(id) {
        const claims = this.findAll();
        return claims.find(claim => claim.id === id);
    }
    findByPolicyId(policyId) {
        const claims = this.findAll();
        return claims.filter(claim => claim.policyId === policyId);
    }
    create(claim) {
        const claims = this.findAll();
        const newId = this.dataService.generateId('CL', claims.map(c => c.id));
        const now = new Date().toISOString();
        const newClaim = {
            ...claim,
            id: newId,
            createdAt: now,
            updatedAt: now,
        };
        claims.push(newClaim);
        this.dataService.writeData(this.fileName, claims);
        return newClaim;
    }
    update(id, claim) {
        const claims = this.findAll();
        const index = claims.findIndex(c => c.id === id);
        if (index === -1) {
            return undefined;
        }
        const now = new Date().toISOString();
        claims[index] = {
            ...claims[index],
            ...claim,
            id: claims[index].id,
            updatedAt: now,
        };
        this.dataService.writeData(this.fileName, claims);
        return claims[index];
    }
    remove(id) {
        const claims = this.findAll();
        const index = claims.findIndex(c => c.id === id);
        if (index === -1) {
            return false;
        }
        claims.splice(index, 1);
        this.dataService.writeData(this.fileName, claims);
        return true;
    }
};
exports.ClaimApplicationService = ClaimApplicationService;
exports.ClaimApplicationService = ClaimApplicationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_service_1.DataService])
], ClaimApplicationService);
//# sourceMappingURL=claim-application.service.js.map