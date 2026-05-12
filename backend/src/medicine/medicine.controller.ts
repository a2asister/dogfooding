import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { MedicineService } from './medicine.service';
import { Medicine } from '../entities/medicine.entity';

@Controller('api/medicines')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Get()
  findAll() {
    return this.medicineService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.medicineService.findOne(id);
  }

  @Post()
  create(@Body() medicine: Partial<Medicine>) {
    return this.medicineService.create(medicine);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() medicine: Partial<Medicine>) {
    return this.medicineService.update(id, medicine);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.medicineService.remove(id);
  }

  @Get('records/today')
  getTodayRecords() {
    return this.medicineService.getTodayRecords();
  }

  @Post('records')
  createRecord(@Body() body: { medicineId: number; scheduledTime: string }) {
    return this.medicineService.createRecord(body.medicineId, body.scheduledTime);
  }

  @Put('records/:id/take')
  markAsTaken(@Param('id') id: number) {
    return this.medicineService.markAsTaken(id);
  }
}
