import { Controller, Post, Body, Get, Param } from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto, LoginDto } from './dto/create-user.dto'
import { User } from './user.entity'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    return this.userService.register(createUserDto)
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ user: Omit<User, 'password'>; token: string }> {
    return this.userService.login(loginDto)
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    return this.userService.findOne(Number(id))
  }
}
