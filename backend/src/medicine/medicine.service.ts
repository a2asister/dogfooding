import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicine } from '../entities/medicine.entity';
import { MedicineRecord } from '../entities/medicine-record.entity';

@Injectable()
export class MedicineService {
  constructor(
    @InjectRepository(Medicine)
    private medicineRepository: Repository<Medicine>,
    @InjectRepository(MedicineRecord)
    private recordRepository: Repository<MedicineRecord>,
  ) {}

  findAll(): Promise<Medicine[]> {
    return this.medicineRepository.find({ where: { isActive: true } });
  }

  findOne(id: number): Promise<Medicine> {
    return this.medicineRepository.findOneBy({ id });
  }

  create(medicine: Partial<Medicine>): Promise<Medicine> {
    return this.medicineRepository.save(medicine);
  }

  async update(id: number, medicine: Partial<Medicine>): Promise<Medicine> {
    await this.medicineRepository.update(id, medicine);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.medicineRepository.update(id, { isActive: false });
  }

  async getTodayRecords(): Promise<MedicineRecord[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.recordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.medicine', 'medicine')
      .where('DATE(record.createdAt) = :today', { today })
      .getMany();
  }

  async createRecord(medicineId: number, scheduledTime: string): Promise<MedicineRecord> {
    const record = this.recordRepository.create({
      medicineId,
      scheduledTime,
      taken: false,
    });
    return this.recordRepository.save(record);
  }

  async markAsTaken(recordId: number): Promise<MedicineRecord> {
    await this.recordRepository.update(recordId, {
      taken: true,
      takenAt: new Date(),
    });
    return this.recordRepository.findOneBy({ id: recordId });
  }
}
