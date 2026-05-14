import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScaleParams } from './scale-params.entity';
import { ScaleParamsService } from './scale-params.service';
import { ScaleParamsController } from './scale-params.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ScaleParams])],
  controllers: [ScaleParamsController],
  providers: [ScaleParamsService],
})
export class ScaleParamsModule {}
