import { useState, useEffect, useCallback } from 'react';
import type { AssetCategory, SubCategory } from '../types/asset';

const API_BASE = 'http://localhost:3456/api/assets';

export function useAssetCategories() {
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(API_BASE);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(async (category: { name: string; color: string; amount: number }) => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...category, subCategories: [] }),
      });
      if (res.ok) {
        await fetchCategories();
        return true;
      }
    } catch (error) {
      console.error('Failed to add category:', error);
    }
    return false;
  }, [fetchCategories]);

  const updateCategory = useCallback(async (id: string, updates: Partial<{ name: string; color: string; amount: number }>) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await fetchCategories();
        return true;
      }
    } catch (error) {
      console.error('Failed to update category:', error);
    }
    return false;
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCategories();
        return true;
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
    return false;
  }, [fetchCategories]);

  const addSubCategory = useCallback(async (categoryId: string, subCategory: { name: string; amount: number }) => {
    try {
      const res = await fetch(`${API_BASE}/${categoryId}/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subCategory),
      });
      if (res.ok) {
        await fetchCategories();
        return true;
      }
    } catch (error) {
      console.error('Failed to add subcategory:', error);
    }
    return false;
  }, [fetchCategories]);

  const updateSubCategory = useCallback(async (categoryId: string, subId: string, updates: Partial<{ name: string; amount: number }>) => {
    try {
      const res = await fetch(`${API_BASE}/${categoryId}/subcategories/${subId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await fetchCategories();
        return true;
      }
    } catch (error) {
      console.error('Failed to update subcategory:', error);
    }
    return false;
  }, [fetchCategories]);

  const deleteSubCategory = useCallback(async (categoryId: string, subId: string) => {
    try {
      const res = await fetch(`${API_BASE}/${categoryId}/subcategories/${subId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCategories();
        return true;
      }
    } catch (error) {
      console.error('Failed to delete subcategory:', error);
    }
    return false;
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
  };
}
