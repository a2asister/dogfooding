import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreference } from '../entity/user-preference.entity';

@Injectable()
export class UserPreferenceService {
  constructor(
    @InjectRepository(UserPreference)
    private userPreferenceRepository: Repository<UserPreference>,
  ) {}

  async findByUserId(userId: string): Promise<UserPreference | null> {
    return this.userPreferenceRepository.findOneBy({ userId });
  }

  async createOrUpdate(
    userId: string,
    data: {
      wallpaperParams: Record<string, any>;
      customEffects?: Record<string, any>;
      lastWallpaperId?: number;
    },
  ): Promise<UserPreference> {
    let preference = await this.findByUserId(userId);
    if (preference) {
      Object.assign(preference, data);
    } else {
      preference = this.userPreferenceRepository.create({ userId, ...data });
    }
    return this.userPreferenceRepository.save(preference);
  }
}