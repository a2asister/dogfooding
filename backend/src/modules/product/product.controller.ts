import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from '../../entities/product.entity';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll(@Query('categoryId') categoryId?: string): Promise<Product[]> {
    return this.productService.findAll(categoryId ? +categoryId : undefined);
  }

  @Get('seller/:sellerId')
  findBySeller(@Param('sellerId') sellerId: string): Promise<Product[]> {
    return this.productService.findBySeller(+sellerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Product | null> {
    return this.productService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.productService.remove(+id);
  }
}
