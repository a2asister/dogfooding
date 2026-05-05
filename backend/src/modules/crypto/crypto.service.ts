import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { createHash, createCipheriv, createDecipheriv, randomBytes, generateKeyPairSync } from 'crypto';

@Injectable()
export class CryptoService {
  private readonly AES_KEY_SIZE = 32;
  private readonly IV_SIZE = 16;
  private readonly HASH_ALGORITHM = 'sha256';

  generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
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

  generateRandomKey(): string {
    return randomBytes(this.AES_KEY_SIZE).toString('hex');
  }

  generateRandomIV(): string {
    return randomBytes(this.IV_SIZE).toString('hex');
  }

  hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || this.generateRandomKey().substring(0, 16);
    const hash = CryptoJS.PBKDF2(password, actualSalt, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
    return { hash, salt: actualSalt };
  }

  verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashPassword(password, salt);
    return computedHash === hash;
  }

  encryptAES(data: string, key: string, iv: string): string {
    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Hex.parse(key), {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  }

  decryptAES(encryptedData: string, key: string, iv: string): string {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Hex.parse(key), {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  encryptFile(buffer: Buffer, key: string): { encryptedData: Buffer; iv: string } {
    const iv = this.generateRandomIV();
    const cipher = createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    const encryptedData = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return { encryptedData, iv };
  }

  decryptFile(buffer: Buffer, key: string, iv: string): Buffer {
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    return Buffer.concat([decipher.update(buffer), decipher.final()]);
  }

  computeHash(buffer: Buffer): string {
    return createHash(this.HASH_ALGORITHM).update(buffer).digest('hex');
  }

  computeStringHash(str: string): string {
    return createHash(this.HASH_ALGORITHM).update(str, 'utf8').digest('hex');
  }

  encryptSensitiveData(data: string, key: string): string {
    const iv = this.generateRandomIV();
    const encrypted = this.encryptAES(data, key, iv);
    return `${iv}:${encrypted}`;
  }

  decryptSensitiveData(encryptedData: string, key: string): string {
    const [iv, data] = encryptedData.split(':');
    return this.decryptAES(data, key, iv);
  }

  maskSensitiveContent(content: string, type: 'password' | 'email' | 'phone' | 'creditCard'): string {
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

  detectSensitiveContent(content: string): { isSensitive: boolean; types: string[] } {
    const patterns = {
      password: /password|passwd|pwd/i,
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      phone: /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/,
      creditCard: /\b(?:\d[ -]*?){13,16}\b/,
      idCard: /\d{17}[\dXx]|\d{15}/,
      bankCard: /\d{16,19}/,
    };

    const detectedTypes: string[] = [];
    
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
}
