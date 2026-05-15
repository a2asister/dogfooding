import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { DesktopConfig } from '../entities/desktop-config.entity';
import { FileItem } from '../entities/file.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(DesktopConfig)
    private desktopConfigRepository: Repository<DesktopConfig>,
    @InjectRepository(FileItem)
    private fileRepository: Repository<FileItem>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { username: registerDto.username },
    });
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.userRepository.create({
      username: registerDto.username,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    const defaultConfig = this.desktopConfigRepository.create({
      user: savedUser,
      wallpaper: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20blue%20windows%2011%20style%20wallpaper%20gradient&image_size=landscape_16_9',
      layout: [
        { id: '1', name: '此电脑', icon: 'computer', x: 20, y: 20, type: 'app' },
        { id: '2', name: '回收站', icon: 'recycle', x: 20, y: 120, type: 'app' },
        { id: '3', name: '文档', icon: 'folder', x: 20, y: 220, type: 'folder' },
      ],
      taskbarConfig: { showTime: true, position: 'bottom' },
      startMenu: [
        { id: '1', name: '文件资源管理器', icon: 'explorer' },
        { id: '2', name: '设置', icon: 'settings' },
      ],
    });
    await this.desktopConfigRepository.save(defaultConfig);

    const rootFolder = this.fileRepository.create({
      name: '根目录',
      type: 'folder',
      content: null,
      parentId: null,
      userId: savedUser.id,
    });
    await this.fileRepository.save(rootFolder);

    const payload = { sub: savedUser.id, username: savedUser.username };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: savedUser.id, username: savedUser.username },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
    });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, username: user.username },
    };
  }
}