import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AssetCategory, SubCategory } from './asset.interface';

@Injectable()
export class AssetService {
  private categories: AssetCategory[] = [
    {
      id: uuidv4(),
      name: '股票',
      color: '#3B82F6',
      amount: 150000,
      subCategories: [
        { id: uuidv4(), name: 'A股', amount: 80000 },
        { id: uuidv4(), name: '港股', amount: 40000 },
        { id: uuidv4(), name: '美股', amount: 30000 },
      ],
    },
    {
      id: uuidv4(),
      name: '债券',
      color: '#10B981',
      amount: 80000,
      subCategories: [
        { id: uuidv4(), name: '国债', amount: 50000 },
        { id: uuidv4(), name: '企业债', amount: 30000 },
      ],
    },
    {
      id: uuidv4(),
      name: '现金',
      color: '#F59E0B',
      amount: 50000,
      subCategories: [
        { id: uuidv4(), name: '活期存款', amount: 30000 },
        { id: uuidv4(), name: '货币基金', amount: 20000 },
      ],
    },
    {
      id: uuidv4(),
      name: '房产',
      color: '#EF4444',
      amount: 200000,
      subCategories: [
        { id: uuidv4(), name: '自住房产', amount: 150000 },
        { id: uuidv4(), name: '投资房产', amount: 50000 },
      ],
    },
    {
      id: uuidv4(),
      name: '其他',
      color: '#8B5CF6',
      amount: 20000,
      subCategories: [
        { id: uuidv4(), name: '黄金', amount: 10000 },
        { id: uuidv4(), name: '收藏品', amount: 10000 },
      ],
    },
  ];

  findAll(): AssetCategory[] {
    return this.categories;
  }

  findOne(id: string): AssetCategory | undefined {
    return this.categories.find((cat) => cat.id === id);
  }

  create(category: Omit<AssetCategory, 'id' | 'subCategories'> & { subCategories?: Omit<SubCategory, 'id'>[] }): AssetCategory {
    const newCategory: AssetCategory = {
      id: uuidv4(),
      name: category.name,
      color: category.color,
      amount: category.amount,
      subCategories: (category.subCategories || []).map((sub) => ({
        id: uuidv4(),
        name: sub.name,
        amount: sub.amount,
      })),
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  update(id: string, updates: Partial<Omit<AssetCategory, 'id' | 'subCategories'>>): AssetCategory | undefined {
    const index = this.categories.findIndex((cat) => cat.id === id);
    if (index === -1) return undefined;
    
    this.categories[index] = { ...this.categories[index], ...updates };
    this.categories[index].amount = this.categories[index].subCategories.reduce((sum, sub) => sum + sub.amount, 0);
    return this.categories[index];
  }

  delete(id: string): boolean {
    const index = this.categories.findIndex((cat) => cat.id === id);
    if (index === -1) return false;
    this.categories.splice(index, 1);
    return true;
  }

  addSubCategory(categoryId: string, subCategory: Omit<SubCategory, 'id'>): SubCategory | undefined {
    const category = this.categories.find((cat) => cat.id === categoryId);
    if (!category) return undefined;
    
    const newSubCategory: SubCategory = {
      id: uuidv4(),
      name: subCategory.name,
      amount: subCategory.amount,
    };
    category.subCategories.push(newSubCategory);
    category.amount = category.subCategories.reduce((sum, sub) => sum + sub.amount, 0);
    return newSubCategory;
  }

  updateSubCategory(categoryId: string, subCategoryId: string, updates: Partial<Omit<SubCategory, 'id'>>): SubCategory | undefined {
    const category = this.categories.find((cat) => cat.id === categoryId);
    if (!category) return undefined;
    
    const subIndex = category.subCategories.findIndex((sub) => sub.id === subCategoryId);
    if (subIndex === -1) return undefined;
    
    category.subCategories[subIndex] = { ...category.subCategories[subIndex], ...updates };
    category.amount = category.subCategories.reduce((sum, sub) => sum + sub.amount, 0);
    return category.subCategories[subIndex];
  }

  deleteSubCategory(categoryId: string, subCategoryId: string): boolean {
    const category = this.categories.find((cat) => cat.id === categoryId);
    if (!category) return false;
    
    const subIndex = category.subCategories.findIndex((sub) => sub.id === subCategoryId);
    if (subIndex === -1) return false;
    
    category.subCategories.splice(subIndex, 1);
    category.amount = category.subCategories.reduce((sum, sub) => sum + sub.amount, 0);
    return true;
  }
}
