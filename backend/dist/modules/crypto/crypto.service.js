"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoService = void 0;
const common_1 = require("@nestjs/common");
const CryptoJS = require("crypto-js");
const crypto_1 = require("crypto");
let CryptoService = class CryptoService {
    constructor() {
        this.AES_KEY_SIZE = 32;
        this.IV_SIZE = 16;
        this.HASH_ALGORITHM = 'sha256';
    }
    generateKeyPair() {
        const { publicKey, privateKey } = (0, crypto_1.generateKeyPairSync)('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            },
        });
        return { publicKey, privateKey };
    }
    generateRandomKey() {
        return (0, crypto_1.randomBytes)(this.AES_KEY_SIZE).toString('hex');
    }
    generateRandomIV() {
        return (0, crypto_1.randomBytes)(this.IV_SIZE).toString('hex');
    }
    hashPassword(password, salt) {
        const actualSalt = salt || this.generateRandomKey().substring(0, 16);
        const hash = CryptoJS.PBKDF2(password, actualSalt, {
            keySize: 256 / 32,
            iterations: 10000,
        }).toString();
        return { hash, salt: actualSalt };
    }
    verifyPassword(password, hash, salt) {
        const { hash: computedHash } = this.hashPassword(password, salt);
        return computedHash === hash;
    }
    encryptAES(data, key, iv) {
        const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Hex.parse(key), {
            iv: CryptoJS.enc.Hex.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        return encrypted.toString();
    }
    decryptAES(encryptedData, key, iv) {
        const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Hex.parse(key), {
            iv: CryptoJS.enc.Hex.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
    encryptFile(buffer, key) {
        const iv = this.generateRandomIV();
        const cipher = (0, crypto_1.createCipheriv)('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
        const encryptedData = Buffer.concat([cipher.update(buffer), cipher.final()]);
        return { encryptedData, iv };
    }
    decryptFile(buffer, key, iv) {
        const decipher = (0, crypto_1.createDecipheriv)('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
        return Buffer.concat([decipher.update(buffer), decipher.final()]);
    }
    computeHash(buffer) {
        return (0, crypto_1.createHash)(this.HASH_ALGORITHM).update(buffer).digest('hex');
    }
    computeStringHash(str) {
        return (0, crypto_1.createHash)(this.HASH_ALGORITHM).update(str, 'utf8').digest('hex');
    }
    encryptSensitiveData(data, key) {
        const iv = this.generateRandomIV();
        const encrypted = this.encryptAES(data, key, iv);
        return `${iv}:${encrypted}`;
    }
    decryptSensitiveData(encryptedData, key) {
        const [iv, data] = encryptedData.split(':');
        return this.decryptAES(data, key, iv);
    }
    maskSensitiveContent(content, type) {
        switch (type) {
            case 'password':
                return '********';
            case 'email':
                const [username, domain] = content.split('@');
                if (username && domain) {
                    const maskedUsername = username.length > 2
                        ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
                        : '*'.repeat(username.length);
                    return `${maskedUsername}@${domain}`;
                }
                return content;
            case 'phone':
                if (content.length >= 7) {
                    return content.substring(0, 3) + '****' + content.substring(content.length - 4);
                }
                return '*'.repeat(content.length);
            case 'creditCard':
                if (content.length >= 16) {
                    return '**** **** **** ' + content.substring(content.length - 4);
                }
                return '*'.repeat(content.length);
            default:
                return content;
        }
    }
    detectSensitiveContent(content) {
        const patterns = {
            password: /password|passwd|pwd/i,
            email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
            phone: /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/,
            creditCard: /\b(?:\d[ -]*?){13,16}\b/,
            idCard: /\d{17}[\dXx]|\d{15}/,
            bankCard: /\d{16,19}/,
        };
        const detectedTypes = [];
        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(content)) {
                detectedTypes.push(type);
            }
        }
        return {
            isSensitive: detectedTypes.length > 0,
            types: detectedTypes,
        };
    }
};
exports.CryptoService = CryptoService;
exports.CryptoService = CryptoService = __decorate([
    (0, common_1.Injectable)()
], CryptoService);
//# sourceMappingURL=crypto.service.js.map