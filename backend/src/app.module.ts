import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EquationRecord } from './entities/equation-record.entity'
import { RecordsController } from './controllers/records.controller'
import { StatisticsController } from './controllers/statistics.controller'
import { RecordsService } from './services/records.service'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'chemical-equations.db',
      entities: [EquationRecord],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([EquationRecord]),
  ],
  controllers: [RecordsController, StatisticsController],
  providers: [RecordsService],
})
export class AppModule {}
