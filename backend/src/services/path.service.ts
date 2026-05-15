import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PathEntity } from '../entities/path.entity';
import { PointEntity } from '../entities/point.entity';

export interface Point {
  id: string;
  x: number;
  y: number;
  isControl?: boolean;
}

export interface PathData {
  id: string;
  name: string;
  points: Point[];
  createdAt: number;
  updatedAt: number;
}

@Injectable()
export class PathService {
  constructor(
    @InjectRepository(PathEntity)
    private pathRepository: Repository<PathEntity>,
  ) {}

  async findAll(): Promise<PathData[]> {
    const paths = await this.pathRepository.find({ relations: ['points'] });
    return paths.map((path) => this.transformPath(path));
  }

  async findById(id: string): Promise<PathData> {
    const path = await this.pathRepository.findOne({
      where: { id },
      relations: ['points'],
    });
    if (!path) {
      throw new NotFoundException('Path not found');
    }
    return this.transformPath(path);
  }

  async create(data: Omit<PathData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PathData> {
    const id = Math.random().toString(36).substring(2, 11);
    const path = this.pathRepository.create({
      id,
      name: data.name,
      points: data.points.map((p, index) => ({
        ...p,
        order: index,
      })),
    });
    const saved = await this.pathRepository.save(path);
    return this.transformPath(saved);
  }

  async update(id: string, data: Partial<PathData>): Promise<PathData> {
    const path = await this.pathRepository.findOne({
      where: { id },
      relations: ['points'],
    });
    if (!path) {
      throw new NotFoundException('Path not found');
    }

    if (data.name) {
      path.name = data.name;
    }

    if (data.points) {
      path.points = data.points.map((p, index) => ({
        ...p,
        order: index,
        pathId: id,
      }));
    }

    const updated = await this.pathRepository.save(path);
    return this.transformPath(updated);
  }

  async delete(id: string): Promise<void> {
    const result = await this.pathRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Path not found');
    }
  }

  private transformPath(path: PathEntity & { points?: PointEntity[] }): PathData {
    return {
      id: path.id,
      name: path.name,
      points: (path.points || [])
        .sort((a, b) => a.order - b.order)
        .map((p) => ({
          id: p.id,
          x: p.x,
          y: p.y,
          isControl: p.isControl,
        })),
      createdAt: path.createdAt,
      updatedAt: path.updatedAt,
    };
  }
}