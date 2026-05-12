import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Flowchart } from './flowchart.entity'
import { FlowchartService } from './flowchart.service'
import { FlowchartResolver } from './flowchart.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([Flowchart])],
  providers: [FlowchartService, FlowchartResolver],
  exports: [FlowchartService]
})
export class FlowchartModule {}
