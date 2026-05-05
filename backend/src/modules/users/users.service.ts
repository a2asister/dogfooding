import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService, User } from '../database/database.service';
import { CryptoService } from '../crypto/crypto.service';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

@Injectable()
export class UsersService {
  constructor(
    private databaseService: DatabaseService,
    private cryptoService: CryptoService,
  ) {}

  async createUser(createUserDto: {
    username: string;
    password: string;
    email: string;
  }): Promise<User> {
    const existingUser = await this.databaseService.getUserByUsername(
      createUserDto.username,
    );
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const { hash, salt } = this.cryptoService.hashPassword(
      createUserDto.password,
    );
    const keyPair = this.cryptoService.generateKeyPair();
    const syncDir = join(__dirname, '..', '..', '..', 'data', 'sync', createUserDto.username);

    if (!existsSync(syncDir)) {
      mkdirSync(syncDir, { recursive: true });
    }

    const user: User = {
      id: uuidv4(),
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

  async findAll(): Promise<User[]> {
    return this.databaseService.getUsers();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.databaseService.getUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.databaseService.getUserByUsername(username);
  }

  async update(
    id: string,
    updateUserDto: Partial<{
      email: string;
      syncDirectory: string;
    }>,
  ): Promise<User> {
    const user = await this.databaseService.updateUser(id, updateUserDto);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.databaseService.getUserByUsername(username);
    if (!user) {
      return null;
    }

    const [salt, storedHash] = user.password.split(':');
    const { hash: computedHash } = this.cryptoService.hashPassword(
      password,
      salt,
    );

    if (computedHash === storedHash) {
      return user;
    }
    return null;
  }

  async getUserProfile(userId: string): Promise<Omit<User, 'password' | 'privateKey'>> {
    const user = await this.findOne(userId);
    const { password, privateKey, ...profile } = user;
    return profile;
  }
}
