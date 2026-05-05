export declare class CryptoService {
    private readonly AES_KEY_SIZE;
    private readonly IV_SIZE;
    private readonly HASH_ALGORITHM;
    generateKeyPair(): {
        publicKey: string;
        privateKey: string;
    };
    generateRandomKey(): string;
    generateRandomIV(): string;
    hashPassword(password: string, salt?: string): {
        hash: string;
        salt: string;
    };
    verifyPassword(password: string, hash: string, salt: string): boolean;
    encryptAES(data: string, key: string, iv: string): string;
    decryptAES(encryptedData: string, key: string, iv: string): string;
    encryptFile(buffer: Buffer, key: string): {
        encryptedData: Buffer;
        iv: string;
    };
    decryptFile(buffer: Buffer, key: string, iv: string): Buffer;
    computeHash(buffer: Buffer): string;
    computeStringHash(str: string): string;
    encryptSensitiveData(data: string, key: string): string;
    decryptSensitiveData(encryptedData: string, key: string): string;
    maskSensitiveContent(content: string, type: 'password' | 'email' | 'phone' | 'creditCard'): string;
    detectSensitiveContent(content: string): {
        isSensitive: boolean;
        types: string[];
    };
}
