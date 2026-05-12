import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Flowchart } from './flowchart.entity'
import { FlowchartInput } from './dto/flowchart.input'

@Injectable()
export class FlowchartService {
  constructor(
    @InjectRepository(Flowchart)
    private flowchartRepository: Repository<Flowchart>
  ) {}

  async findAll(): Promise<Flowchart[]> {
    return this.flowchartRepository.find()
  }

  async findOne(id: string): Promise<Flowchart> {
    const flowchart = await this.flowchartRepository.findOne({ where: { id } })
    if (!flowchart) {
      throw new NotFoundException('Flowchart not found')
    }
    return flowchart
  }

  async save(data: FlowchartInput): Promise<Flowchart> {
    const flowchart = data.id
      ? await this.findOne(data.id)
      : this.flowchartRepository.create()

    flowchart.name = data.name
    flowchart.nodes = JSON.stringify(data.nodes)
    flowchart.connections = JSON.stringify(data.connections)

    return this.flowchartRepository.save(flowchart)
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.flowchartRepository.delete(id)
    return (result.affected ?? 0) > 0
  }

  async exportImage(id: string): Promise<string> {
    const flowchart = await this.findOne(id)
    return flowchart.id
  }
}
