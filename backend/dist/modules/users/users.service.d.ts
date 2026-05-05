import { DatabaseService, User } from '../database/database.service';
import { CryptoService } from '../crypto/crypto.service';
export declare class UsersService {
    private databaseService;
    private cryptoService;
    constructor(databaseService: DatabaseService, cryptoService: CryptoService);
    createUser(createUserDto: {
        username: string;
        password: string;
        email: string;
    }): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByUsername(username: string): Promise<User | undefined>;
    update(id: string, updateUserDto: Partial<{
        email: string;
        syncDirectory: string;
    }>): Promise<User>;
    validateUser(username: string, password: string): Promise<User | null>;
    getUserProfile(userId: string): Promise<Omit<User, 'password' | 'privateKey'>>;
}
