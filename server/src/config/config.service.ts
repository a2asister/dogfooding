import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Config } from '../entity/Config'

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(Config)
    private configRepository: Repository<Config>
  ) {}

  async create(data: { name: string; category: string; config: any }) {
    const config = this.configRepository.create(data)
    return this.configRepository.save(config)
  }

  async findAll() {
    return this.configRepository.find({
      order: { createdAt: 'DESC' }
    })
  }

  async findByCategory(category: string) {
    return this.configRepository.find({
      where: { category },
      order: { createdAt: 'DESC' }
    })
  }

  async findOne(id: number) {
    return this.configRepository.findOne({ where: { id } })
  }

  async delete(id: number) {
    return this.configRepository.delete(id)
  }

  async getCategories() {
    const configs = await this.configRepository.find({ select: ['category'] })
    const categories = [...new Set(configs.map(c => c.category))]
    return categories.filter(c => c).sort()
  }

  async update(id: number, data: { name: string; category: string; config: any }) {
    return this.configRepository.update(id, data)
  }
}
