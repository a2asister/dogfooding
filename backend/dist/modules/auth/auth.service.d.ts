import { UsersService } from '../users/users.service';
import { CryptoService } from '../crypto/crypto.service';
export declare class AuthService {
    private usersService;
    private cryptoService;
    constructor(usersService: UsersService, cryptoService: CryptoService);
    login(username: string, password: string): Promise<{
        id: string;
        username: string;
        email: string;
        createdAt: string;
        publicKey: string;
        syncDirectory: string;
    }>;
    logout(session: any): Promise<unknown>;
    getCurrentUser(session: any): any;
}
