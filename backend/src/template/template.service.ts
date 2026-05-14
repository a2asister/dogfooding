import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CardTemplate } from './template.entity'

@Injectable()
export class TemplateService implements OnModuleInit {
  constructor(
    @InjectRepository(CardTemplate)
    private templateRepository: Repository<CardTemplate>
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedTemplates()
  }

  private async seedTemplates(): Promise<void> {
    const count = await this.templateRepository.count()
    if (count > 0) return

    const defaultTemplates = [
      {
        name: '新年快乐',
        description: '春节主题贺卡，喜庆红色背景',
        category: '节日',
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
        defaultContent: {
          title: '新年快乐',
          message: '祝你在新的一年里：\n身体健康，万事如意！\n财源滚滚，心想事成！'
        },
        decorations: [
          { id: 1, emoji: '🧧', x: 50, y: 80 },
          { id: 2, emoji: '🎆', x: 300, y: 60 },
          { id: 3, emoji: '🏮', x: 80, y: 450 }
        ]
      },
      {
        name: '生日快乐',
        description: '温馨生日贺卡，蛋糕主题',
        category: '生日',
        background: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
        defaultContent: {
          title: '生日快乐',
          message: '祝你生日快乐！\n愿你的每一天都充满阳光和快乐！\n梦想成真，幸福永远！'
        },
        decorations: [
          { id: 1, emoji: '🎂', x: 170, y: 100 },
          { id: 2, emoji: '🎈', x: 50, y: 200 },
          { id: 3, emoji: '🎁', x: 300, y: 420 }
        ]
      },
      {
        name: '情人节',
        description: '浪漫爱心，甜蜜表白',
        category: '爱情',
        background: 'linear-gradient(135deg, #e84393 0%, #fd79a8 100%)',
        defaultContent: {
          title: '情人节快乐',
          message: '亲爱的，\n情人节快乐！\n你是我生命中最美好的礼物，\n爱你永远！'
        },
        decorations: [
          { id: 1, emoji: '❤️', x: 170, y: 80 },
          { id: 2, emoji: '💕', x: 80, y: 200 },
          { id: 3, emoji: '💝', x: 280, y: 450 }
        ]
      },
      {
        name: '圣诞节',
        description: '雪花飘落，圣诞快乐',
        category: '节日',
        background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
        defaultContent: {
          title: '圣诞快乐',
          message: '祝你圣诞快乐！\n愿圣诞老人给你带来满满的礼物和惊喜！\n新年快乐！'
        },
        decorations: [
          { id: 1, emoji: '🎄', x: 170, y: 70 },
          { id: 2, emoji: '🎅', x: 60, y: 180 },
          { id: 3, emoji: '❄️', x: 310, y: 460 }
        ]
      },
      {
        name: '感谢恩师',
        description: '感恩老师，辛勤付出',
        category: '感谢',
        background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        defaultContent: {
          title: '教师节快乐',
          message: '敬爱的老师，\n感谢您的辛勤付出和悉心教导！\n祝您节日快乐，身体健康！'
        },
        decorations: [
          { id: 1, emoji: '👨‍🏫', x: 170, y: 80 },
          { id: 2, emoji: '📚', x: 50, y: 200 },
          { id: 3, emoji: '✏️', x: 300, y: 440 }
        ]
      },
      {
        name: '中秋团圆',
        description: '月圆人团圆，中秋快乐',
        category: '节日',
        background: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
        defaultContent: {
          title: '中秋快乐',
          message: '祝你中秋快乐！\n月圆人团圆，\n愿你和家人幸福美满！'
        },
        decorations: [
          { id: 1, emoji: '🌕', x: 170, y: 60 },
          { id: 2, emoji: '🥮', x: 60, y: 220 },
          { id: 3, emoji: '🐰', x: 300, y: 450 }
        ]
      }
    ]

    for (const template of defaultTemplates) {
      const t = this.templateRepository.create(template)
      await this.templateRepository.save(t)
    }
  }

  async findAll(category?: string): Promise<CardTemplate[]> {
    const where = category ? { category } : {}
    return this.templateRepository.find({
      where,
      order: { createdAt: 'DESC' }
    })
  }

  async findOne(id: number): Promise<CardTemplate | null> {
    return this.templateRepository.findOne({ where: { id } })
  }
}
