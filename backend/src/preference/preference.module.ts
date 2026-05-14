import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Preference } from '../entities/preference.entity';
import { PreferenceService } from './preference.service';
import { PreferenceController } from './preference.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Preference])],
  controllers: [PreferenceController],
  providers: [PreferenceService],
})
export class PreferenceModule {}
