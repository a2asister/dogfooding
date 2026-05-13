import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserInput } from './dto/create-user.input';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`用户 ${id} 未找到`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    const existingUser = await this.findByUsername(createUserInput.username);
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }
    const user = this.userRepository.create(createUserInput);
    return this.userRepository.save(user);
  }

  async getOrCreate(username: string, nickname?: string): Promise<User> {
    let user = await this.findByUsername(username);
    if (!user) {
      user = this.userRepository.create({
        username,
        nickname: nickname || username,
      });
      user = await this.userRepository.save(user);
    }
    return user;
  }
}
