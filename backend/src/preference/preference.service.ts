import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Preference } from '../entities/preference.entity';

@Injectable()
export class PreferenceService {
  constructor(
    @InjectRepository(Preference)
    private preferenceRepository: Repository<Preference>,
  ) {}

  async find(): Promise<Preference> {
    const preferences = await this.preferenceRepository.find();
    if (preferences.length > 0) {
      return preferences[0];
    }
    const defaultPref = this.preferenceRepository.create({
      favoriteColors: [],
      preferredStyles: [],
      colorScheme: 'balanced',
    });
    return this.preferenceRepository.save(defaultPref);
  }

  async update(id: string, preference: Partial<Preference>): Promise<Preference | null> {
    await this.preferenceRepository.update(id, preference);
    return this.preferenceRepository.findOneBy({ id });
  }
}
