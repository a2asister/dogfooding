import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({
      relations: ['subtitles'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['subtitles'],
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async create(name: string): Promise<Project> {
    const project = this.projectRepository.create({
      name,
      videoWidth: 1080,
      videoHeight: 1920,
      backgroundColor: '#000000',
    });
    return this.projectRepository.save(project);
  }

  async update(id: string, updateData: Partial<Project>): Promise<Project> {
    await this.projectRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.projectRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
