import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AssetCategory, SubCategory } from '../types/asset';

const API_BASE = 'http://localhost:3456/api/assets';

interface AssetContextType {
  categories: AssetCategory[];
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (category: { name: string; color: string; amount: number }) => Promise<boolean>;
  updateCategory: (id: string, updates: Partial<{ name: string; color: string; amount: number }>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  addSubCategory: (categoryId: string, subCategory: { name: string; amount: number }) => Promise<boolean>;
  updateSubCategory: (categoryId: string, subId: string, updates: Partial<{ name: string; amount: number }>) => Promise<boolean>;
  deleteSubCategory: (categoryId: string, subId: string) => Promise<boolean>;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export function AssetProvider({ children }: { children: ReactNode }) {
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

  return (
    <AssetContext.Provider
      value={{
        categories,
        isLoading,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubCategory,
        updateSubCategory,
        deleteSubCategory,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
}

export function useAssetContext() {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error('useAssetContext must be used within an AssetProvider');
  }
  return context;
}
