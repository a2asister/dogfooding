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
exports.InsuranceProductService = void 0;
const common_1 = require("@nestjs/common");
const data_service_1 = require("./data.service");
let InsuranceProductService = class InsuranceProductService {
    constructor(dataService) {
        this.dataService = dataService;
        this.fileName = 'insurance-products.json';
    }
    findAll() {
        return this.dataService.readData(this.fileName);
    }
    findOne(id) {
        const products = this.findAll();
        return products.find(product => product.id === id);
    }
    create(product) {
        const products = this.findAll();
        const newId = this.dataService.generateId('IP', products.map(p => p.id));
        const now = new Date().toISOString();
        const newProduct = {
            ...product,
            id: newId,
            createdAt: now,
            updatedAt: now,
        };
        products.push(newProduct);
        this.dataService.writeData(this.fileName, products);
        return newProduct;
    }
    update(id, product) {
        const products = this.findAll();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) {
            return undefined;
        }
        const now = new Date().toISOString();
        products[index] = {
            ...products[index],
            ...product,
            id: products[index].id,
            updatedAt: now,
        };
        this.dataService.writeData(this.fileName, products);
        return products[index];
    }
    remove(id) {
        const products = this.findAll();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) {
            return false;
        }
        products.splice(index, 1);
        this.dataService.writeData(this.fileName, products);
        return true;
    }
};
exports.InsuranceProductService = InsuranceProductService;
exports.InsuranceProductService = InsuranceProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_service_1.DataService])
], InsuranceProductService);
//# sourceMappingURL=insurance-product.service.js.map