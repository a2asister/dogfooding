export interface FoodItem {
  id: string
  imageUrl: string
  shopName: string
  visitDate: string
  category: FoodCategory
  rating: number
  notes: string
}

export type FoodCategory = '中餐' | '西餐' | '甜品' | '饮品'

export interface Stats {
  total: number
  currentMonth: number
  monthlyStats: { [key: string]: number }
  categoryStats: { [key: string]: number }
}

export const CATEGORIES: FoodCategory[] = ['中餐', '西餐', '甜品', '饮品']

export const CATEGORY_COLORS: Record<FoodCategory, { bg: string; text: string }> = {
  '中餐': { bg: 'rgba(200, 80, 60, 0.15)', text: 'rgb(200, 80, 60)' },
  '西餐': { bg: 'rgba(100, 130, 180, 0.15)', text: 'rgb(100, 130, 180)' },
  '甜品': { bg: 'rgba(200, 150, 170, 0.15)', text: 'rgb(200, 150, 170)' },
  '饮品': { bg: 'rgba(120, 170, 120, 0.15)', text: 'rgb(120, 170, 120)' }
}
