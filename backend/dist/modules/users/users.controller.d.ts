import { UsersService } from './users.service';
import { Request } from 'express';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(createUserDto: {
        username: string;
        password: string;
        email: string;
    }): Promise<{
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
    getProfile(req: Request): Promise<{
        success: boolean;
        data: Omit<import("../database/database.service").User, "password" | "privateKey">;
    }>;
    findOne(id: string): Promise<{
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
    updateProfile(req: Request, updateUserDto: Partial<{
        email: string;
        syncDirectory: string;
    }>): Promise<{
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
}
