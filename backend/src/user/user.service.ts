import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { CreateUserDto, LoginDto } from './dto/create-user.dto'

@Injectable()
export class UserService {
  private currentUserId: number | null = null

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async register(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existing = await this.userRepository.findOne({
      where: { username: createUserDto.username }
    })
    
    if (existing) {
      throw new ConflictException('用户名已存在')
    }

    const user = this.userRepository.create({
      ...createUserDto,
      nickname: createUserDto.nickname || createUserDto.username
    })
    
    const saved = await this.userRepository.save(user)
    const { password, ...result } = saved
    return result
  }

  async login(loginDto: LoginDto): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username }
    })
    
    if (!user || user.password !== loginDto.password) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    this.currentUserId = user.id
    const { password, ...result } = user
    return {
      user: result,
      token: `user-${user.id}-${Date.now()}`
    }
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } })
  }

  getCurrentUserId(): number | null {
    return this.currentUserId
  }
}
