import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepository.create(createProjectDto);
    return this.projectRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    await this.projectRepository.update(id, updateProjectDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

  async calculateResponsiveParams(
    pageStructure: string,
    deviceType: string,
  ): Promise<Record<string, any>> {
    const structure = JSON.parse(pageStructure);
    const baseWidth = deviceType === 'mobile' ? 375 : deviceType === 'tablet' ? 768 : 1440;
    const baseHeight = deviceType === 'mobile' ? 667 : deviceType === 'tablet' ? 1024 : 900;

    const responsiveParams: Record<string, any> = {
      deviceType,
      viewport: { width: baseWidth, height: baseHeight },
      elements: {},
    };

    if (structure.elements && Array.isArray(structure.elements)) {
      structure.elements.forEach((element: any) => {
        const scaleFactor = baseWidth / 1440;
        responsiveParams.elements[element.id] = {
          x: Math.round((element.x || 0) * scaleFactor),
          y: Math.round((element.y || 0) * scaleFactor),
          width: Math.round((element.width || 100) * scaleFactor),
          height: Math.round((element.height || 100) * scaleFactor),
          fontSize: Math.round((element.fontSize || 16) * scaleFactor),
        };
      });
    }

    return responsiveParams;
  }

  async calibrateScroll(
    animationConfig: string,
    scrollProgress: number,
  ): Promise<{ calibratedProgress: number; adjustedTriggers: any[] }> {
    const config = JSON.parse(animationConfig);
    const triggers = config.triggers || [];

    const adjustedTriggers = triggers.map((trigger: any) => {
      const adjustedStart = (trigger.start || 0) + (scrollProgress - 0.5) * 0.1;
      const adjustedEnd = (trigger.end || 1) + (scrollProgress - 0.5) * 0.1;
      return {
        ...trigger,
        start: Math.max(0, Math.min(1, adjustedStart)),
        end: Math.max(0, Math.min(1, adjustedEnd)),
      };
    });

    return {
      calibratedProgress: scrollProgress,
      adjustedTriggers,
    };
  }
}
