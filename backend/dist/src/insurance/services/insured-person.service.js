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
exports.InsuredPersonService = void 0;
const common_1 = require("@nestjs/common");
const data_service_1 = require("./data.service");
let InsuredPersonService = class InsuredPersonService {
    constructor(dataService) {
        this.dataService = dataService;
        this.fileName = 'insured-persons.json';
    }
    findAll() {
        return this.dataService.readData(this.fileName);
    }
    findOne(id) {
        const persons = this.findAll();
        return persons.find(person => person.id === id);
    }
    create(person) {
        const persons = this.findAll();
        const newId = this.dataService.generateId('IPER', persons.map(p => p.id));
        const now = new Date().toISOString();
        const newPerson = {
            ...person,
            id: newId,
            createdAt: now,
            updatedAt: now,
        };
        persons.push(newPerson);
        this.dataService.writeData(this.fileName, persons);
        return newPerson;
    }
    update(id, person) {
        const persons = this.findAll();
        const index = persons.findIndex(p => p.id === id);
        if (index === -1) {
            return undefined;
        }
        const now = new Date().toISOString();
        persons[index] = {
            ...persons[index],
            ...person,
            id: persons[index].id,
            updatedAt: now,
        };
        this.dataService.writeData(this.fileName, persons);
        return persons[index];
    }
    remove(id) {
        const persons = this.findAll();
        const index = persons.findIndex(p => p.id === id);
        if (index === -1) {
            return false;
        }
        persons.splice(index, 1);
        this.dataService.writeData(this.fileName, persons);
        return true;
    }
};
exports.InsuredPersonService = InsuredPersonService;
exports.InsuredPersonService = InsuredPersonService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_service_1.DataService])
], InsuredPersonService);
//# sourceMappingURL=insured-person.service.js.map