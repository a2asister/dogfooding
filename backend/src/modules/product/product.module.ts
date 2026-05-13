import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../entities/product.entity';
import { Favorite } from '../../entities/favorite.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Favorite])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
