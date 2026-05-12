import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Member } from './member.entity'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class MemberService implements OnModuleInit {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async onModuleInit() {
    await this.seedData()
  }

  async seedData() {
    const count = await this.memberRepository.count()
    if (count > 0) return

    const members = [
      {
        id: uuidv4(),
        name: '张三',
        email: 'zhangsan@example.com',
        password: '123456',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
        role: '前端工程师',
        bio: '热爱技术，专注于Vue生态系统开发。有5年前端开发经验，擅长构建高性能Web应用。',
        isOnline: false,
      },
      {
        id: uuidv4(),
        name: '李四',
        email: 'lisi@example.com',
        password: '123456',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        role: '后端工程师',
        bio: 'Node.js专家，熟悉微服务架构设计。致力于构建稳定可靠的后端服务。',
        isOnline: false,
      },
      {
        id: uuidv4(),
        name: '王五',
        email: 'wangwu@example.com',
        password: '123456',
        avatar: 'https://images.unsplash.com/photo-1438761681035-649b1f16f337?w=200&h=200&fit=crop&crop=face',
        role: '产品经理',
        bio: '6年产品经验，擅长用户体验设计和产品规划。热爱创新，追求极致用户体验。',
        isOnline: false,
      },
      {
        id: uuidv4(),
        name: '赵六',
        email: 'zhaoliu@example.com',
        password: '123456',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
        role: 'UI设计师',
        bio: '视觉设计专家，精通Figma和Sketch。用设计创造价值，让产品更有温度。',
        isOnline: false,
      },
      {
        id: uuidv4(),
        name: '钱七',
        email: 'qianqi@example.com',
        password: '123456',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
        role: '测试工程师',
        bio: '质量保障专家，擅长自动化测试和性能测试。保障每一行代码的质量。',
        isOnline: false,
      },
    ]

    await this.memberRepository.save(members)
  }

  async findAll(): Promise<Member[]> {
    return this.memberRepository.find({
      order: { createdAt: 'ASC' },
    })
  }

  async findOne(id: string): Promise<Member> {
    return this.memberRepository.findOneBy({ id })
  }

  async update(id: string, updateMemberInput: Partial<Member>): Promise<Member> {
    await this.memberRepository.update(id, updateMemberInput)
    return this.findOne(id)
  }

  async login(email: string, password: string): Promise<Member & { token: string }> {
    const member = await this.memberRepository.findOneBy({ email })
    
    if (!member || member.password !== password) {
      throw new UnauthorizedException('邮箱或密码错误')
    }

    const token = Buffer.from(`${member.id}:${Date.now()}`).toString('base64')

    return {
      ...member,
      token,
    }
  }

  async heartbeat(userId: string): Promise<Member> {
    const member = await this.findOne(userId)
    if (!member) {
      throw new UnauthorizedException('用户不存在')
    }

    member.isOnline = true
    member.lastSeen = new Date()
    await this.memberRepository.save(member)
    
    return member
  }

  async logout(userId: string): Promise<boolean> {
    const member = await this.findOne(userId)
    if (member) {
      member.isOnline = false
      member.lastSeen = new Date()
      await this.memberRepository.save(member)
    }
    return true
  }
}
