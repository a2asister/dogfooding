import { Controller, Get } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EquationRecord } from '../entities/equation-record.entity'

@Controller('statistics')
export class StatisticsController {
  constructor(
    @InjectRepository(EquationRecord)
    private recordsRepository: Repository<EquationRecord>,
  ) {}

  @Get()
  async getStatistics() {
    const records = await this.recordsRepository.find()
    
    const totalAttempts = records.length
    const correctCount = records.filter(r => r.isCorrect).length
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0
    const avgTimeSpent = totalAttempts > 0 
      ? Math.round(records.reduce((sum, r) => sum + r.timeSpent, 0) / totalAttempts)
      : 0

    const equationAttempts: Record<string, number[]> = {}
    records.forEach(r => {
      if (!equationAttempts[r.equation]) {
        equationAttempts[r.equation] = []
      }
      equationAttempts[r.equation].push(r.attempts)
    })

    const difficultEquations = Object.entries(equationAttempts)
      .filter(([_, attempts]) => attempts.some(a => a > 1))
      .map(([equation, attempts]) => {
        const record = records.find(r => r.equation === equation)!
        return {
          id: record.id,
          equation,
          balancedEquation: record.balancedEquation,
          isCorrect: record.isCorrect,
          attempts: Math.max(...attempts),
          timeSpent: record.timeSpent,
          createdAt: record.createdAt.toISOString(),
        }
      })
      .slice(0, 5)

    return {
      totalAttempts,
      correctCount,
      accuracy,
      avgTimeSpent,
      difficultEquations,
      recentRecords: records.slice(0, 5).map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    }
  }
}
