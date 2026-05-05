import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { InsuranceProductService } from '../services/insurance-product.service';
import { InsuranceProduct } from '../interfaces/insurance.interface';

@Controller('insurance-products')
export class InsuranceProductController {
  constructor(private readonly insuranceProductService: InsuranceProductService) {}

  @Get()
  findAll(): InsuranceProduct[] {
    return this.insuranceProductService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): InsuranceProduct {
    const product = this.insuranceProductService.findOne(id);
    if (!product) {
      throw new HttpException('Insurance product not found', HttpStatus.NOT_FOUND);
    }
    return product;
  }

  @Post()
  create(@Body() product: Omit<InsuranceProduct, 'id' | 'createdAt' | 'updatedAt'>): InsuranceProduct {
    return this.insuranceProductService.create(product);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() product: Partial<InsuranceProduct>): InsuranceProduct {
    const updatedProduct = this.insuranceProductService.update(id, product);
    if (!updatedProduct) {
      throw new HttpException('Insurance product not found', HttpStatus.NOT_FOUND);
    }
    return updatedProduct;
  }

  @Delete(':id')
  remove(@Param('id') id: string): { success: boolean } {
    const success = this.insuranceProductService.remove(id);
    if (!success) {
      throw new HttpException('Insurance product not found', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }
}
