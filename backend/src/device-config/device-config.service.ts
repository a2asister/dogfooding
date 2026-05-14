import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceConfig } from '../entity/device-config.entity';

@Injectable()
export class DeviceConfigService {
  constructor(
    @InjectRepository(DeviceConfig)
    private deviceConfigRepository: Repository<DeviceConfig>,
  ) {}

  async findAll(): Promise<DeviceConfig[]> {
    return this.deviceConfigRepository.find();
  }

  async findOne(id: number): Promise<DeviceConfig | null> {
    return this.deviceConfigRepository.findOneBy({ id });
  }

  async create(data: {
    deviceName: string;
    screenWidth: number;
    screenHeight: number;
    refreshRate?: number;
  }): Promise<DeviceConfig> {
    const config = this.deviceConfigRepository.create({
      ...data,
      effectSettings: {
        microMovement: 1.0,
        gravitySensitivity: 1.0,
        pressIntensity: 1.0,
        transitionSpeed: 1.0,
      },
    });
    return this.deviceConfigRepository.save(config);
  }

  async updateEffectSettings(
    id: number,
    settings: Partial<DeviceConfig['effectSettings']>,
  ): Promise<DeviceConfig | null> {
    const config = await this.findOne(id);
    if (config) {
      config.effectSettings = { ...config.effectSettings, ...settings };
      return this.deviceConfigRepository.save(config);
    }
    return null;
  }
}