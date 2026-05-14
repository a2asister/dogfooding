import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../entities/character.entity';

@Injectable()
export class CharacterService implements OnModuleInit {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.characterRepository.count();
    if (count === 0) {
      await this.seedData();
    }
  }

  private async seedData(): Promise<void> {
    const seedCharacters = [
      {
        char: '好',
        pinyin: 'hǎo',
        meaning: 'good',
        totalStrokes: 6,
        structure: '左右结构',
        radicals: [
          { name: '女', strokeCount: 3, pathData: '', position: { x: 0, y: 0 }, isErrorProne: false },
          { name: '子', strokeCount: 3, pathData: '', position: { x: 1, y: 0 }, isErrorProne: true },
        ],
      },
      {
        char: '明',
        pinyin: 'míng',
        meaning: 'bright',
        totalStrokes: 8,
        structure: '左右结构',
        radicals: [
          { name: '日', strokeCount: 4, pathData: '', position: { x: 0, y: 0 }, isErrorProne: false },
          { name: '月', strokeCount: 4, pathData: '', position: { x: 1, y: 0 }, isErrorProne: false },
        ],
      },
      {
        char: '林',
        pinyin: 'lín',
        meaning: 'forest',
        totalStrokes: 8,
        structure: '左右结构',
        radicals: [
          { name: '木', strokeCount: 4, pathData: '', position: { x: 0, y: 0 }, isErrorProne: false },
          { name: '木', strokeCount: 4, pathData: '', position: { x: 1, y: 0 }, isErrorProne: true },
        ],
      },
      {
        char: '森',
        pinyin: 'sēn',
        meaning: 'forest',
        totalStrokes: 12,
        structure: '品字结构',
        radicals: [
          { name: '木', strokeCount: 4, pathData: '', position: { x: 1, y: 0 }, isErrorProne: false },
          { name: '木', strokeCount: 4, pathData: '', position: { x: 0, y: 1 }, isErrorProne: false },
          { name: '木', strokeCount: 4, pathData: '', position: { x: 2, y: 1 }, isErrorProne: false },
        ],
      },
      {
        char: '休',
        pinyin: 'xiū',
        meaning: 'rest',
        totalStrokes: 6,
        structure: '左右结构',
        radicals: [
          { name: '亻', strokeCount: 2, pathData: '', position: { x: 0, y: 0 }, isErrorProne: false },
          { name: '木', strokeCount: 4, pathData: '', position: { x: 1, y: 0 }, isErrorProne: false },
        ],
      },
      {
        char: '李',
        pinyin: 'lǐ',
        meaning: 'plum',
        totalStrokes: 7,
        structure: '上下结构',
        radicals: [
          { name: '木', strokeCount: 4, pathData: '', position: { x: 0, y: 0 }, isErrorProne: false },
          { name: '子', strokeCount: 3, pathData: '', position: { x: 0, y: 1 }, isErrorProne: true },
        ],
      },
      {
        char: '张',
        pinyin: 'zhāng',
        meaning: 'stretch',
        totalStrokes: 7,
        structure: '左右结构',
        radicals: [
          { name: '弓', strokeCount: 3, pathData: '', position: { x: 0, y: 0 }, isErrorProne: false },
          { name: '长', strokeCount: 4, pathData: '', position: { x: 1, y: 0 }, isErrorProne: true },
        ],
      },
      {
        char: '想',
        pinyin: 'xiǎng',
        meaning: 'think',
        totalStrokes: 13,
        structure: '上下结构',
        radicals: [
          { name: '相', strokeCount: 9, pathData: '', position: { x: 0, y: 0 }, isErrorProne: false },
          { name: '心', strokeCount: 4, pathData: '', position: { x: 0, y: 1 }, isErrorProne: false },
        ],
      },
    ];

    for (const char of seedCharacters) {
      await this.characterRepository.save(this.characterRepository.create(char));
    }
  }

  async findAll(): Promise<Character[]> {
    return this.characterRepository.find({ relations: ['radicals'] });
  }

  async findOne(id: string): Promise<Character | null> {
    return this.characterRepository.findOne({ where: { id }, relations: ['radicals'] });
  }

  async create(characterData: Omit<Character, 'id'>): Promise<Character> {
    const character = this.characterRepository.create(characterData);
    return this.characterRepository.save(character);
  }
}
