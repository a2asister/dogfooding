import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './skill.entity';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
  ) {}

  async findByUserId(userId: number): Promise<Skill[]> {
    return this.skillRepository.find({ where: { userId } });
  }

  async create(skillData: Partial<Skill>): Promise<Skill> {
    const skill = this.skillRepository.create(skillData);
    return this.skillRepository.save(skill);
  }

  async update(id: number, skillData: Partial<Skill>): Promise<Skill | null> {
    await this.skillRepository.update(id, skillData);
    return this.skillRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.skillRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async updatePositions(skills: { id: number; positionX: number; positionY: number; rotation: number }[]): Promise<Skill[]> {
    for (const skill of skills) {
      await this.skillRepository.update(skill.id, {
        positionX: skill.positionX,
        positionY: skill.positionY,
        rotation: skill.rotation,
      });
    }
    const ids = skills.map(s => s.id);
    return this.skillRepository.findByIds(ids);
  }
}