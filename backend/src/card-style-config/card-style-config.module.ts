import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardStyleConfig } from './card-style-config.entity';
import { CardStyleConfigService } from './card-style-config.service';
import { CardStyleConfigResolver } from './card-style-config.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([CardStyleConfig])],
  providers: [CardStyleConfigService, CardStyleConfigResolver],
  exports: [CardStyleConfigService],
})
export class CardStyleConfigModule {}