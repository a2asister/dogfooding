import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { InsuredPersonService } from '../services/insured-person.service';
import { InsuredPerson } from '../interfaces/insurance.interface';

@Controller('insured-persons')
export class InsuredPersonController {
  constructor(private readonly insuredPersonService: InsuredPersonService) {}

  @Get()
  findAll(): InsuredPerson[] {
    return this.insuredPersonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): InsuredPerson {
    const person = this.insuredPersonService.findOne(id);
    if (!person) {
      throw new HttpException('Insured person not found', HttpStatus.NOT_FOUND);
    }
    return person;
  }

  @Post()
  create(@Body() person: Omit<InsuredPerson, 'id' | 'createdAt' | 'updatedAt'>): InsuredPerson {
    return this.insuredPersonService.create(person);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() person: Partial<InsuredPerson>): InsuredPerson {
    const updatedPerson = this.insuredPersonService.update(id, person);
    if (!updatedPerson) {
      throw new HttpException('Insured person not found', HttpStatus.NOT_FOUND);
    }
    return updatedPerson;
  }

  @Delete(':id')
  remove(@Param('id') id: string): { success: boolean } {
    const success = this.insuredPersonService.remove(id);
    if (!success) {
      throw new HttpException('Insured person not found', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }
}
