import { Component, createSignal, createEffect, For } from 'solid-js';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import ComparisonZone from './components/ComparisonZone';
import ComparisonTable from './components/ComparisonTable';
import {
  products,
  comparisonList,
  loading,
  selectedCategory,
  setSelectedCategory,
  categories,
  fetchProducts,
  addToComparison,
  removeFromComparison,
  clearComparison,
  createProduct,
  updateProduct,
  deleteProduct,
  filteredProducts
} from './store';
import { Product } from './types';

const App: Component = () => {
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [editingProduct, setEditingProduct] = createSignal<Product | null>(null);
  const [draggedProductId, setDraggedProductId] = createSignal<string | null>(null);
  const [isDragOverComparison, setIsDragOverComparison] = createSignal(false);

  createEffect(() => {
    fetchProducts();
  });

  const handleDragStart = (e: DragEvent, productId: string) => {
    setDraggedProductId(productId);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', productId);
    }
  };

  const handleDragEnd = () => {
    setDraggedProductId(null);
    setIsDragOverComparison(false);
  };

  const handleDragOver = (_e: DragEvent) => {
    setIsDragOverComparison(true);
  };

  const handleDragLeave = () => {
    setIsDragOverComparison(false);
  };

  const handleDrop = (e: DragEvent) => {
    setIsDragOverComparison(false);
    const productId = draggedProductId() || (e.dataTransfer?.getData('text/plain') || '');
    if (productId) {
      const product = products().find(p => p.id === productId);
      if (product) {
        addToComparison(product);
      }
    }
    setDraggedProductId(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    const confirmed = confirm(`确定要删除商品 "${product.name}" 吗？\n\n此操作不可撤销！`);
    if (confirmed) {
      deleteProduct(product.id);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct()) {
      await updateProduct(editingProduct()!.id, productData);
    } else {
      await createProduct(productData);
    }
  };

  const getCategoryLabel = (cat: string) => {
    if (cat === 'all') return '全部';
    return cat;
  };

  return (
    <div class="app-container">
      <header class="header">
        <h1>智选对比器</h1>
        <p>拖拽商品到对比区域，智能分析差异，助您做出明智选择</p>
      </header>

      <div class="main-layout">
        <div class="section">
          <div class="section-header">
            <h2>商品库 <span class="comparison-count">{products().length}</span></h2>
            <button class="btn btn-primary" onClick={handleAddProduct}>
              + 添加商品
            </button>
          </div>

          <div class="category-filter">
            <For each={categories()}>
              {(category) => (
                <button
                  class={`category-btn ${selectedCategory() === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {getCategoryLabel(category)}
                </button>
              )}
            </For>
          </div>

          {loading() ? (
            <div class="empty-state">
              <div class="empty-state-icon">⏳</div>
              <div class="empty-state-text">加载中...</div>
            </div>
          ) : filteredProducts().length === 0 ? (
            <div class="empty-state">
              <div class="empty-state-icon">📦</div>
              <div class="empty-state-text">
                <p>暂无商品</p>
                <p style="margin-top: 8px; font-size: 0.9rem; color: #aaa">
                  点击上方按钮添加第一个商品
                </p>
              </div>
            </div>
          ) : (
            <div class="product-grid">
              <For each={filteredProducts()}>
                {(product) => (
                  <ProductCard
                    product={product}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedProductId() === product.id}
                  />
                )}
              </For>
            </div>
          )}
        </div>

        <div class="section">
          <div class="section-header">
            <h2>
              对比区域 
              <span class="comparison-count" style="margin-left: 12px">
                {comparisonList().length}/4
              </span>
            </h2>
          </div>

          <ComparisonZone
            products={comparisonList()}
            isDragOver={isDragOverComparison()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onRemove={removeFromComparison}
            onClear={clearComparison}
          />

          {comparisonList().length >= 2 && (
            <>
              <div class="section-header" style="margin-top: 24px; margin-bottom: 16px">
                <h2>对比详情</h2>
              </div>
              <ComparisonTable products={comparisonList()} />
            </>
          )}
        </div>
      </div>

      {isModalOpen() && (
        <ProductModal
          product={editingProduct()}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};

export default App;
