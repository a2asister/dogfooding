import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Drawing } from './entities/drawing.entity'
import { DrawingPath } from './entities/path.entity'
import { Version } from './entities/version.entity'
import { CreateDrawingInput } from './dto/create-drawing.input'
import { UpdateDrawingInput } from './dto/update-drawing.input'

@Injectable()
export class DrawingService {
  constructor(
    @InjectRepository(Drawing)
    private readonly drawingRepository: Repository<Drawing>,
    @InjectRepository(DrawingPath)
    private readonly pathRepository: Repository<DrawingPath>,
    @InjectRepository(Version)
    private readonly versionRepository: Repository<Version>
  ) {}

  async create(createDrawingInput: CreateDrawingInput): Promise<Drawing> {
    const drawing = this.drawingRepository.create({
      name: createDrawingInput.name,
      paths: createDrawingInput.paths
    })
    const saved = await this.drawingRepository.save(drawing)
    await this.createVersion(saved.id)
    return saved
  }

  async findAll(): Promise<Drawing[]> {
    return this.drawingRepository.find()
  }

  async findOne(id: string): Promise<Drawing> {
    const drawing = await this.drawingRepository.findOne({ where: { id } })
    if (!drawing) {
      throw new NotFoundException(`Drawing with ID "${id}" not found`)
    }
    return drawing
  }

  async update(updateDrawingInput: UpdateDrawingInput): Promise<Drawing> {
    const drawing = await this.findOne(updateDrawingInput.id)
    
    if (updateDrawingInput.name) {
      drawing.name = updateDrawingInput.name
    }
    
    if (updateDrawingInput.paths) {
      drawing.paths = updateDrawingInput.paths as unknown as DrawingPath[]
    }
    
    const updated = await this.drawingRepository.save(drawing)
    await this.createVersion(updated.id)
    return updated
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.drawingRepository.delete(id)
    return (result.affected || 0) > 0
  }

  async createVersion(drawingId: string): Promise<Version> {
    const drawing = await this.findOne(drawingId)
    const version = this.versionRepository.create({
      drawing,
      snapshot: JSON.stringify(drawing.paths)
    })
    return this.versionRepository.save(version)
  }

  async getVersions(drawingId: string): Promise<Version[]> {
    return this.versionRepository.find({
      where: { drawing: { id: drawingId } },
      order: { createdAt: 'DESC' }
    })
  }

  async exportSVG(id: string): Promise<string> {
    const drawing = await this.findOne(id)
    const paths = drawing.paths.map(p => 
      `<path d="${p.pathData}" stroke="${p.strokeColor}" stroke-width="${p.strokeWidth}" fill="${p.fillColor || 'none'}"/>`
    ).join('\n')
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
  ${paths}
</svg>`
  }
}
