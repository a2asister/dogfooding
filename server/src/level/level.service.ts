import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Level } from '../entity/Level';

@Injectable()
export class LevelService implements OnModuleInit {
  constructor(
    @InjectRepository(Level)
    private levelRepository: Repository<Level>,
  ) {}

  async onModuleInit() {
    const count = await this.levelRepository.count();
    if (count === 0) {
      await this.seedLevels();
    }
  }

  async seedLevels() {
    const levels = [
      {
        title: '逻辑入门',
        description: '基础逻辑推理，适合新手入门',
        difficulty: 1,
        points: 10,
        isUnlocked: true,
        question: {
          type: 'choice',
          content: '如果所有的猫都喜欢吃鱼，而咪咪是一只猫，那么？',
          options: ['咪咪喜欢吃鱼', '咪咪不喜欢吃鱼', '不确定', '咪咪是狗'],
          answer: '咪咪喜欢吃鱼',
          hints: ['根据前提进行推理', "所有的猫都具有'喜欢吃鱼'这个属性"],
        },
      },
      {
        title: '数列推理',
        description: '找出数字规律，填写正确答案',
        difficulty: 1,
        points: 15,
        isUnlocked: false,
        question: {
          type: 'input',
          content: '请填写下一个数字：2, 4, 8, 16, ?',
          answer: '32',
          hints: ['观察每个数字之间的关系', '每个数字是前一个的2倍'],
        },
      },
      {
        title: '图形推理',
        description: '观察图形变化，找出规律',
        difficulty: 2,
        points: 20,
        isUnlocked: false,
        question: {
          type: 'choice',
          content: '□ → ○ → □ → ○ → ？',
          options: ['□', '○', '△', '◇'],
          answer: '□',
          hints: ['观察图形交替规律', '正方形和圆形交替出现'],
        },
      },
      {
        title: '条件推理',
        description: '复杂条件判断',
        difficulty: 2,
        points: 25,
        isUnlocked: false,
        question: {
          type: 'choice',
          content: '如果A→B，B→C，C→D，那么A→？',
          options: ['A', 'B', 'C', 'D'],
          answer: 'D',
          hints: ['传递性推理', 'A可以推导出B，B推导出C...'],
        },
      },
      {
        title: '逆向思维',
        description: '反向思考问题',
        difficulty: 3,
        points: 30,
        isUnlocked: false,
        question: {
          type: 'input',
          content: '一个池塘里的荷花，每天长大一倍，10天长满整个池塘，请问第几天长满一半？',
          answer: '9',
          hints: ['反过来思考', '第10天长满，那前一天就是一半'],
        },
      },
    ];

    for (const level of levels) {
      await this.levelRepository.save(this.levelRepository.create(level));
    }
  }

  findAll(): Promise<Level[]> {
    return this.levelRepository.find({ order: { difficulty: 'ASC', id: 'ASC' } });
  }

  findOne(id: number): Promise<Level | null> {
    return this.levelRepository.findOneBy({ id });
  }

  async unlockNextLevel(currentLevelId: number) {
    const levels = await this.findAll();
    const currentIndex = levels.findIndex(l => l.id === currentLevelId);
    if (currentIndex < levels.length - 1) {
      const nextLevel = levels[currentIndex + 1];
      nextLevel.isUnlocked = true;
      await this.levelRepository.save(nextLevel);
      return nextLevel;
    }
    return null;
  }
}
