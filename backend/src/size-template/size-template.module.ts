import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SizeTemplate } from './size-template.entity';
import { SizeTemplateService } from './size-template.service';
import { SizeTemplateController } from './size-template.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SizeTemplate])],
  controllers: [SizeTemplateController],
  providers: [SizeTemplateService],
})
export class SizeTemplateModule {}
