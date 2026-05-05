import { Injectable } from '@nestjs/common';
import { DataService } from './data.service';
import { InsuredPerson } from '../interfaces/insurance.interface';

@Injectable()
export class InsuredPersonService {
  private readonly fileName = 'insured-persons.json';

  constructor(private readonly dataService: DataService) {}

  findAll(): InsuredPerson[] {
    return this.dataService.readData<InsuredPerson>(this.fileName);
  }

  findOne(id: string): InsuredPerson | undefined {
    const persons = this.findAll();
    return persons.find(person => person.id === id);
  }

  create(person: Omit<InsuredPerson, 'id' | 'createdAt' | 'updatedAt'>): InsuredPerson {
    const persons = this.findAll();
    const newId = this.dataService.generateId('IPER', persons.map(p => p.id));
    const now = new Date().toISOString();
    
    const newPerson: InsuredPerson = {
      ...person,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    
    persons.push(newPerson);
    this.dataService.writeData(this.fileName, persons);
    
    return newPerson;
  }

  update(id: string, person: Partial<InsuredPerson>): InsuredPerson | undefined {
    const persons = this.findAll();
    const index = persons.findIndex(p => p.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    const now = new Date().toISOString();
    persons[index] = {
      ...persons[index],
      ...person,
      id: persons[index].id,
      updatedAt: now,
    };
    
    this.dataService.writeData(this.fileName, persons);
    return persons[index];
  }

  remove(id: string): boolean {
    const persons = this.findAll();
    const index = persons.findIndex(p => p.id === id);
    
    if (index === -1) {
      return false;
    }
    
    persons.splice(index, 1);
    this.dataService.writeData(this.fileName, persons);
    return true;
  }
}
