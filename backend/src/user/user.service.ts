import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(username: string, avatar?: string): Promise<User> {
    const user = this.userRepository.create({ username, avatar });
    return this.userRepository.save(user);
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, data);
    return this.findOne(id);
  }

  async togglePrivacy(id: number, isPublic: boolean): Promise<User | null> {
    return this.update(id, { isPublic });
  }
}