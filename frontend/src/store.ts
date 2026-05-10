import { createSignal } from 'solid-js';
import { Product } from './types';
import { productApi } from './api';

const [products, setProducts] = createSignal<Product[]>([]);
const [comparisonList, setComparisonList] = createSignal<Product[]>([]);
const [loading, setLoading] = createSignal(false);
const [selectedCategory, setSelectedCategory] = createSignal<string>('all');
const [categories, setCategories] = createSignal<string[]>([]);

async function fetchProducts() {
  setLoading(true);
  try {
    const data = await productApi.getAll();
    setProducts(data);
    const uniqueCategories = ['all', ...Array.from(new Set(data.map(p => p.category)))];
    setCategories(uniqueCategories);
  } finally {
    setLoading(false);
  }
}

function addToComparison(product: Product) {
  const current = comparisonList();
  if (current.find(p => p.id === product.id)) return;
  if (current.length >= 4) {
    alert('最多只能对比4个商品');
    return;
  }
  setComparisonList([...current, product]);
}

function removeFromComparison(productId: string) {
  setComparisonList(comparisonList().filter(p => p.id !== productId));
}

function clearComparison() {
  setComparisonList([]);
}

async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
  const newProduct = await productApi.create(product);
  setProducts([newProduct, ...products()]);
  const cats = Array.from(new Set([...categories().filter(c => c !== 'all'), newProduct.category]));
  setCategories(['all', ...cats]);
}

async function updateProduct(id: string, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
  const updated = await productApi.update(id, product);
  setProducts(products().map(p => p.id === id ? updated : p));
  setComparisonList(comparisonList().map(p => p.id === id ? updated : p));
  const cats = Array.from(new Set([...categories().filter(c => c !== 'all'), updated.category]));
  setCategories(['all', ...cats]);
}

async function deleteProduct(id: string) {
  await productApi.delete(id);
  setProducts(products().filter(p => p.id !== id));
  setComparisonList(comparisonList().filter(p => p.id !== id));
}

function filteredProducts() {
  const cat = selectedCategory();
  if (cat === 'all') return products();
  return products().filter(p => p.category === cat);
}

export {
  products,
  setProducts,
  comparisonList,
  setComparisonList,
  loading,
  setLoading,
  selectedCategory,
  setSelectedCategory,
  categories,
  setCategories,
  fetchProducts,
  addToComparison,
  removeFromComparison,
  clearComparison,
  createProduct,
  updateProduct,
  deleteProduct,
  filteredProducts
};
