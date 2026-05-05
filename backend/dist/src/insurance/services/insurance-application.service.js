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
exports.InsuranceApplicationService = void 0;
const common_1 = require("@nestjs/common");
const data_service_1 = require("./data.service");
let InsuranceApplicationService = class InsuranceApplicationService {
    constructor(dataService) {
        this.dataService = dataService;
        this.fileName = 'insurance-applications.json';
    }
    findAll() {
        return this.dataService.readData(this.fileName);
    }
    findOne(id) {
        const applications = this.findAll();
        return applications.find(application => application.id === id);
    }
    create(application) {
        const applications = this.findAll();
        const newId = this.dataService.generateId('IA', applications.map(a => a.id));
        const now = new Date().toISOString();
        const newApplication = {
            ...application,
            id: newId,
            createdAt: now,
            updatedAt: now,
        };
        applications.push(newApplication);
        this.dataService.writeData(this.fileName, applications);
        return newApplication;
    }
    update(id, application) {
        const applications = this.findAll();
        const index = applications.findIndex(a => a.id === id);
        if (index === -1) {
            return undefined;
        }
        const now = new Date().toISOString();
        applications[index] = {
            ...applications[index],
            ...application,
            id: applications[index].id,
            updatedAt: now,
        };
        this.dataService.writeData(this.fileName, applications);
        return applications[index];
    }
    remove(id) {
        const applications = this.findAll();
        const index = applications.findIndex(a => a.id === id);
        if (index === -1) {
            return false;
        }
        applications.splice(index, 1);
        this.dataService.writeData(this.fileName, applications);
        return true;
    }
};
exports.InsuranceApplicationService = InsuranceApplicationService;
exports.InsuranceApplicationService = InsuranceApplicationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_service_1.DataService])
], InsuranceApplicationService);
//# sourceMappingURL=insurance-application.service.js.map