import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DrawingService } from './drawing.service'
import { DrawingResolver } from './drawing.resolver'
import { Drawing } from './entities/drawing.entity'
import { DrawingPath } from './entities/path.entity'
import { Version } from './entities/version.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Drawing, DrawingPath, Version])],
  providers: [DrawingResolver, DrawingService],
  exports: [DrawingService]
})
export class DrawingModule {}
