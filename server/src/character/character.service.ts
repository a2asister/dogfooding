import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character, Rarity } from './character.entity';

@Injectable()
export class CharacterService implements OnModuleInit {
  constructor(
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
  ) {}

  async onModuleInit() {
    await this.seedCharacters();
  }

  private async seedCharacters() {
    const count = await this.characterRepository.count();
    if (count > 0) return;

    const characters: Partial<Character>[] = [
      {
        name: '炎之战士',
        description: '来自火焰星球的勇敢战士，能够操控火焰进行战斗。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20fire%20warrior%20character%20portrait%20fantasy%20game%20card&image_size=square',
        rarity: Rarity.NORMAL,
        element: 'Fire',
        gridPosition: 1,
      },
      {
        name: '冰霜女王',
        description: '统治冰雪王国的神秘女王，拥有绝对零度的力量。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20ice%20queen%20character%20portrait%20fantasy%20game%20card&image_size=square',
        rarity: Rarity.NORMAL,
        element: 'Ice',
        gridPosition: 2,
      },
      {
        name: '雷电法师',
        description: '精通雷电魔法的强大法师，可以召唤闪电攻击敌人。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20thunder%20mage%20character%20portrait%20fantasy%20game%20card&image_size=square',
        rarity: Rarity.NORMAL,
        element: 'Lightning',
        gridPosition: 3,
      },
      {
        name: '风之精灵',
        description: '能够自由操控风的精灵，速度极快难以捉摸。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20wind%20spirit%20character%20portrait%20fantasy%20game%20card&image_size=square',
        rarity: Rarity.NORMAL,
        element: 'Wind',
        gridPosition: 4,
      },
      {
        name: '暗影刺客',
        description: '来自暗之国度的神秘刺客，擅长在阴影中给予致命一击。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20shadow%20assassin%20character%20portrait%20fantasy%20game%20card&image_size=square',
        rarity: Rarity.RARE,
        element: 'Shadow',
        gridPosition: 5,
      },
      {
        name: '圣光骑士',
        description: '守护光明的神圣骑士，拥有治愈和净化的能力。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20holy%20knight%20character%20portrait%20fantasy%20game%20card&image_size=square',
        rarity: Rarity.RARE,
        element: 'Light',
        gridPosition: 6,
      },
      {
        name: '森林守护者',
        description: '古老森林的守护者，能够与植物和动物沟通。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20forest%20guardian%20character%20portrait%20fantasy%20game%20card&image_size=square',
        rarity: Rarity.RARE,
        element: 'Nature',
        gridPosition: 7,
      },
      {
        name: '海洋领主',
        description: '统治深海的神秘领主，能够召唤海怪助战。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20ocean%20lord%20character%20portrait%20fantasy%20game%20card&image_size=square',
        rarity: Rarity.RARE,
        element: 'Water',
        gridPosition: 8,
      },
      {
        name: '时间守望者',
        description: '传说中能够操控时间的神秘存在，是时空的守护者。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20time%20guardian%20character%20portrait%20legendary%20fantasy%20game%20card&image_size=square',
        rarity: Rarity.LEGENDARY,
        element: 'Time',
        gridPosition: 9,
      },
      {
        name: '虚空之王',
        description: '来自虚空深渊的终极存在，拥有扭曲现实的恐怖力量。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20void%20king%20character%20portrait%20legendary%20fantasy%20game%20card&image_size=square',
        rarity: Rarity.LEGENDARY,
        element: 'Void',
        gridPosition: 10,
      },
    ];

    for (const char of characters) {
      await this.characterRepository.save(char);
    }
  }

  findAll(): Promise<Character[]> {
    return this.characterRepository.find({
      order: { gridPosition: 'ASC' },
    });
  }

  findById(id: string): Promise<Character | null> {
    return this.characterRepository.findOneBy({ id });
  }

  create(character: Partial<Character>): Promise<Character> {
    return this.characterRepository.save(character);
  }

  async update(id: string, update: Partial<Character>): Promise<Character> {
    await this.characterRepository.update(id, update);
    return this.characterRepository.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.characterRepository.delete(id);
  }
}
