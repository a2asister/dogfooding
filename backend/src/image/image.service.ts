import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './image.entity';

@Injectable()
export class ImageService implements OnModuleInit {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  async onModuleInit() {
    const count = await this.imageRepository.count();
    if (count === 0) {
      await this.seedData();
    }
  }

  private async seedData() {
    const images = [
      {
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20mountain%20landscape%20at%20sunset&image_size=landscape_16_9',
        title: '山间落日',
        description: '壮丽的山峦在夕阳的余晖中闪耀',
        category: '自然',
      },
      {
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20city%20skyline%20at%20night&image_size=landscape_16_9',
        title: '城市夜景',
        description: '繁华都市的霓虹灯光',
        category: '城市',
      },
      {
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cat%20portrait%20close%20up&image_size=landscape_16_9',
        title: '可爱猫咪',
        description: '萌态可掬的猫咪特写',
        category: '动物',
      },
      {
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ocean%20waves%20tropical%20beach&image_size=landscape_16_9',
        title: '热带海滩',
        description: '碧海蓝天，沙白水清',
        category: '自然',
      },
      {
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20temple%20architecture%20detail&image_size=landscape_16_9',
        title: '古老神庙',
        description: '历史的印记，建筑的艺术',
        category: '建筑',
      },
      {
        url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20flower%20garden%20spring&image_size=landscape_16_9',
        title: '春日花园',
        description: '百花齐放，春意盎然',
        category: '自然',
      },
    ];

    for (const image of images) {
      const img = this.imageRepository.create(image);
      await this.imageRepository.save(img);
    }
  }

  findAll(): Promise<Image[]> {
    return this.imageRepository.find();
  }

  findByCategory(category: string): Promise<Image[]> {
    return this.imageRepository.find({ where: { category } });
  }

  findAllCategories(): Promise<Image[]> {
    return this.imageRepository
      .createQueryBuilder('image')
      .select('DISTINCT image.category', 'category')
      .getRawMany();
  }
}
