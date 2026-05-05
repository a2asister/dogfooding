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
exports.AntiFraudService = void 0;
const common_1 = require("@nestjs/common");
const data_service_1 = require("./data.service");
let AntiFraudService = class AntiFraudService {
    constructor(dataService) {
        this.dataService = dataService;
        this.fileName = 'anti-fraud-records.json';
    }
    findAll() {
        return this.dataService.readData(this.fileName);
    }
    findOne(id) {
        const records = this.findAll();
        return records.find(record => record.id === id);
    }
    findByRelatedId(relatedId) {
        const records = this.findAll();
        return records.filter(record => record.relatedId === relatedId);
    }
    create(record) {
        const records = this.findAll();
        const newId = this.dataService.generateId('AFR', records.map(r => r.id));
        const now = new Date().toISOString();
        const newRecord = {
            ...record,
            id: newId,
            createdAt: now,
            updatedAt: now,
        };
        records.push(newRecord);
        this.dataService.writeData(this.fileName, records);
        return newRecord;
    }
    update(id, record) {
        const records = this.findAll();
        const index = records.findIndex(r => r.id === id);
        if (index === -1) {
            return undefined;
        }
        const now = new Date().toISOString();
        records[index] = {
            ...records[index],
            ...record,
            id: records[index].id,
            updatedAt: now,
        };
        this.dataService.writeData(this.fileName, records);
        return records[index];
    }
    remove(id) {
        const records = this.findAll();
        const index = records.findIndex(r => r.id === id);
        if (index === -1) {
            return false;
        }
        records.splice(index, 1);
        this.dataService.writeData(this.fileName, records);
        return true;
    }
};
exports.AntiFraudService = AntiFraudService;
exports.AntiFraudService = AntiFraudService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_service_1.DataService])
], AntiFraudService);
//# sourceMappingURL=anti-fraud.service.js.map