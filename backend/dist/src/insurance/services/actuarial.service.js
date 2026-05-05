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
exports.ActuarialService = void 0;
const common_1 = require("@nestjs/common");
const data_service_1 = require("./data.service");
let ActuarialService = class ActuarialService {
    constructor(dataService) {
        this.dataService = dataService;
        this.fileName = 'actuarial-data.json';
    }
    findAll() {
        return this.dataService.readData(this.fileName);
    }
    findOne(id) {
        const data = this.findAll();
        return data.find(item => item.id === id);
    }
    findByProductId(productId) {
        const data = this.findAll();
        return data.filter(item => item.productId === productId);
    }
    create(data) {
        const allData = this.findAll();
        const newId = this.dataService.generateId('AD', allData.map(d => d.id));
        const now = new Date().toISOString();
        const newData = {
            ...data,
            id: newId,
            createdAt: now,
            updatedAt: now,
        };
        allData.push(newData);
        this.dataService.writeData(this.fileName, allData);
        return newData;
    }
    update(id, data) {
        const allData = this.findAll();
        const index = allData.findIndex(d => d.id === id);
        if (index === -1) {
            return undefined;
        }
        const now = new Date().toISOString();
        allData[index] = {
            ...allData[index],
            ...data,
            id: allData[index].id,
            updatedAt: now,
        };
        this.dataService.writeData(this.fileName, allData);
        return allData[index];
    }
    remove(id) {
        const allData = this.findAll();
        const index = allData.findIndex(d => d.id === id);
        if (index === -1) {
            return false;
        }
        allData.splice(index, 1);
        this.dataService.writeData(this.fileName, allData);
        return true;
    }
};
exports.ActuarialService = ActuarialService;
exports.ActuarialService = ActuarialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_service_1.DataService])
], ActuarialService);
//# sourceMappingURL=actuarial.service.js.map