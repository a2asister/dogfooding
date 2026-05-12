import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineController } from './medicine.controller';
import { MedicineService } from './medicine.service';
import { Medicine } from '../entities/medicine.entity';
import { MedicineRecord } from '../entities/medicine-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine, MedicineRecord])],
  controllers: [MedicineController],
  providers: [MedicineService],
  exports: [MedicineService],
})
export class MedicineModule {}
