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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const database_service_1 = require("../database/database.service");
const crypto_service_1 = require("../crypto/crypto.service");
const path_1 = require("path");
const fs_1 = require("fs");
let UsersService = class UsersService {
    constructor(databaseService, cryptoService) {
        this.databaseService = databaseService;
        this.cryptoService = cryptoService;
    }
    async createUser(createUserDto) {
        const existingUser = await this.databaseService.getUserByUsername(createUserDto.username);
        if (existingUser) {
            throw new common_1.ConflictException('Username already exists');
        }
        const { hash, salt } = this.cryptoService.hashPassword(createUserDto.password);
        const keyPair = this.cryptoService.generateKeyPair();
        const syncDir = (0, path_1.join)(__dirname, '..', '..', '..', 'data', 'sync', createUserDto.username);
        if (!(0, fs_1.existsSync)(syncDir)) {
            (0, fs_1.mkdirSync)(syncDir, { recursive: true });
        }
        const user = {
            id: (0, uuid_1.v4)(),
            username: createUserDto.username,
            password: `${salt}:${hash}`,
            email: createUserDto.email,
            createdAt: new Date().toISOString(),
            privateKey: keyPair.privateKey,
            publicKey: keyPair.publicKey,
            syncDirectory: syncDir,
        };
        return this.databaseService.createUser(user);
    }
    async findAll() {
        return this.databaseService.getUsers();
    }
    async findOne(id) {
        const user = await this.databaseService.getUserById(id);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByUsername(username) {
        return this.databaseService.getUserByUsername(username);
    }
    async update(id, updateUserDto) {
        const user = await this.databaseService.updateUser(id, updateUserDto);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async validateUser(username, password) {
        const user = await this.databaseService.getUserByUsername(username);
        if (!user) {
            return null;
        }
        const [salt, storedHash] = user.password.split(':');
        const { hash: computedHash } = this.cryptoService.hashPassword(password, salt);
        if (computedHash === storedHash) {
            return user;
        }
        return null;
    }
    async getUserProfile(userId) {
        const user = await this.findOne(userId);
        const { password, privateKey, ...profile } = user;
        return profile;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        crypto_service_1.CryptoService])
], UsersService);
//# sourceMappingURL=users.service.js.map