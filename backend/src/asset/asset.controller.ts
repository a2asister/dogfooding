import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetCategory, SubCategory } from './asset.interface';

@Controller('api/assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  findAll(): AssetCategory[] {
    return this.assetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): AssetCategory {
    const category = this.assetService.findOne(id);
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    return category;
  }

  @Post()
  create(@Body() category: Omit<AssetCategory, 'id' | 'subCategories'> & { subCategories?: Omit<SubCategory, 'id'>[] }): AssetCategory {
    return this.assetService.create(category);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updates: Partial<Omit<AssetCategory, 'id' | 'subCategories'>>): AssetCategory {
    const updated = this.assetService.update(id, updates);
    if (!updated) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  @Delete(':id')
  delete(@Param('id') id: string): { success: boolean } {
    const deleted = this.assetService.delete(id);
    if (!deleted) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }

  @Post(':id/subcategories')
  addSubCategory(@Param('id') categoryId: string, @Body() subCategory: Omit<SubCategory, 'id'>): SubCategory {
    const added = this.assetService.addSubCategory(categoryId, subCategory);
    if (!added) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    return added;
  }

  @Put(':id/subcategories/:subId')
  updateSubCategory(
    @Param('id') categoryId: string,
    @Param('subId') subCategoryId: string,
    @Body() updates: Partial<Omit<SubCategory, 'id'>>,
  ): SubCategory {
    const updated = this.assetService.updateSubCategory(categoryId, subCategoryId, updates);
    if (!updated) {
      throw new HttpException('SubCategory not found', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  @Delete(':id/subcategories/:subId')
  deleteSubCategory(@Param('id') categoryId: string, @Param('subId') subCategoryId: string): { success: boolean } {
    const deleted = this.assetService.deleteSubCategory(categoryId, subCategoryId);
    if (!deleted) {
      throw new HttpException('SubCategory not found', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }
}
