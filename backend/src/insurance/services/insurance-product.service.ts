import { Injectable } from '@nestjs/common';
import { DataService } from './data.service';
import { InsuranceProduct } from '../interfaces/insurance.interface';

@Injectable()
export class InsuranceProductService {
  private readonly fileName = 'insurance-products.json';

  constructor(private readonly dataService: DataService) {}

  findAll(): InsuranceProduct[] {
    return this.dataService.readData<InsuranceProduct>(this.fileName);
  }

  findOne(id: string): InsuranceProduct | undefined {
    const products = this.findAll();
    return products.find(product => product.id === id);
  }

  create(product: Omit<InsuranceProduct, 'id' | 'createdAt' | 'updatedAt'>): InsuranceProduct {
    const products = this.findAll();
    const newId = this.dataService.generateId('IP', products.map(p => p.id));
    const now = new Date().toISOString();
    
    const newProduct: InsuranceProduct = {
      ...product,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    
    products.push(newProduct);
    this.dataService.writeData(this.fileName, products);
    
    return newProduct;
  }

  update(id: string, product: Partial<InsuranceProduct>): InsuranceProduct | undefined {
    const products = this.findAll();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    const now = new Date().toISOString();
    products[index] = {
      ...products[index],
      ...product,
      id: products[index].id,
      updatedAt: now,
    };
    
    this.dataService.writeData(this.fileName, products);
    return products[index];
  }

  remove(id: string): boolean {
    const products = this.findAll();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      return false;
    }
    
    products.splice(index, 1);
    this.dataService.writeData(this.fileName, products);
    return true;
  }
}
