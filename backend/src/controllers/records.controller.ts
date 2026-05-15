import { Controller, Get, Post, Body } from '@nestjs/common'
import { RecordsService } from '../services/records.service'

interface CreateRecordDto {
  equation: string
  balancedEquation: string
  isCorrect: boolean
  attempts: number
  timeSpent: number
}

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  async findAll() {
    return this.recordsService.findAll()
  }

  @Post()
  async create(@Body() createRecordDto: CreateRecordDto) {
    return this.recordsService.create(createRecordDto)
  }
}
