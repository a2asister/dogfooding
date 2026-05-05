import { Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    login(loginDto: {
        username: string;
        password: string;
    }, req: Request): Promise<{
        success: boolean;
        data: {
            id: string;
            username: string;
            email: string;
            createdAt: string;
            publicKey: string;
            syncDirectory: string;
        };
    }>;
    logout(req: Request): Promise<{
        success: boolean;
        message: string;
    }>;
    getCurrentUser(req: Request): Promise<{
        success: boolean;
        data: Omit<import("../database/database.service").User, "password" | "privateKey">;
    }>;
    checkAuth(req: Request): Promise<{
        success: boolean;
        data: {
            authenticated: boolean;
            userId?: undefined;
        };
    } | {
        success: boolean;
        data: {
            authenticated: boolean;
            userId: any;
        };
    }>;
}
