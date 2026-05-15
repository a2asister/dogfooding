import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EquationRecord } from '../entities/equation-record.entity'

interface CreateRecordDto {
  equation: string
  balancedEquation: string
  isCorrect: boolean
  attempts: number
  timeSpent: number
}

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(EquationRecord)
    private recordsRepository: Repository<EquationRecord>,
  ) {}

  async findAll(): Promise<EquationRecord[]> {
    return this.recordsRepository.find({
      order: { createdAt: 'DESC' },
    })
  }

  async create(createRecordDto: CreateRecordDto): Promise<EquationRecord> {
    const record = this.recordsRepository.create(createRecordDto)
    return this.recordsRepository.save(record)
  }
}
