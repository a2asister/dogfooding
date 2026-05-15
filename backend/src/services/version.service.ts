import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PathVersionEntity } from '../entities/path-version.entity';
import { PathEntity } from '../entities/path.entity';
import { PathData } from './path.service';

export interface PathVersion {
  id: string;
  pathId: string;
  versionNumber: number;
  data: PathData;
  createdAt: number;
  description: string;
}

@Injectable()
export class VersionService {
  constructor(
    @InjectRepository(PathVersionEntity)
    private versionRepository: Repository<PathVersionEntity>,
    @InjectRepository(PathEntity)
    private pathRepository: Repository<PathEntity>,
  ) {}

  async getByPathId(pathId: string): Promise<PathVersion[]> {
    const versions = await this.versionRepository.find({
      where: { pathId },
      order: { versionNumber: 'DESC' },
    });
    return versions;
  }

  async create(data: { pathId: string; description: string }): Promise<PathVersion> {
    const path = await this.pathRepository.findOne({
      where: { id: data.pathId },
      relations: ['points'],
    });
    if (!path) {
      throw new NotFoundException('Path not found');
    }

    const lastVersion = await this.versionRepository.findOne({
      where: { pathId: data.pathId },
      order: { versionNumber: 'DESC' },
    });

    const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
    const id = Math.random().toString(36).substring(2, 11);

    const version = this.versionRepository.create({
      id,
      pathId: data.pathId,
      versionNumber,
      description: data.description,
      data: {
        id: path.id,
        name: path.name,
        points: (path.points || []).map((p) => ({
          id: p.id,
          x: p.x,
          y: p.y,
          isControl: p.isControl,
        })),
        createdAt: path.createdAt,
        updatedAt: path.updatedAt,
      },
    });

    return this.versionRepository.save(version);
  }

  async restore(versionId: string): Promise<PathData> {
    const version = await this.versionRepository.findOne({
      where: { id: versionId },
    });
    if (!version) {
      throw new NotFoundException('Version not found');
    }

    let path = await this.pathRepository.findOne({
      where: { id: version.pathId },
      relations: ['points'],
    });

    if (!path) {
      path = this.pathRepository.create({
        id: version.pathId,
        name: version.data.name,
        points: version.data.points.map((p, index) => ({
          ...p,
          order: index,
        })),
      });
    } else {
      path.name = version.data.name;
      path.points = version.data.points.map((p, index) => ({
        ...p,
        order: index,
        pathId: version.pathId,
      }));
    }

    const savedPath = await this.pathRepository.save(path);
    return {
      id: savedPath.id,
      name: savedPath.name,
      points: (savedPath.points || [])
        .sort((a, b) => a.order - b.order)
        .map((p) => ({
          id: p.id,
          x: p.x,
          y: p.y,
          isControl: p.isControl,
        })),
      createdAt: savedPath.createdAt,
      updatedAt: savedPath.updatedAt,
    };
  }
}