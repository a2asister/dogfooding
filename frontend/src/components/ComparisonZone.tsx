import { Component, createSignal, For } from 'solid-js';
import { Product } from '../types';

interface ComparisonZoneProps {
  products: Product[];
  isDragOver: boolean;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
}

const ComparisonZone: Component<ComparisonZoneProps> = (props) => {
  const [removingIds, setRemovingIds] = createSignal<Set<string>>(new Set());
  
  const handleRemove = async (productId: string) => {
    setRemovingIds(new Set([...removingIds(), productId]));
    setTimeout(() => {
      props.onRemove(productId);
      const newSet = new Set(removingIds());
      newSet.delete(productId);
      setRemovingIds(newSet);
    }, 600);
  };

  return (
    <div class="comparison-zone">
      <div
        class={`comparison-drop-zone ${props.isDragOver ? 'drag-over' : ''} ${props.products.length === 0 ? 'empty' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          props.onDragOver(e);
        }}
        onDragLeave={props.onDragLeave}
        onDrop={(e) => {
          e.preventDefault();
          props.onDrop(e);
        }}
      >
        {props.products.length === 0 ? (
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <div class="empty-state-text">
              <p class="comparison-hint">拖拽商品到这里开始对比</p>
              <p style="margin-top: 8px; font-size: 0.9rem">最多支持对比4个商品</p>
            </div>
          </div>
        ) : (
          <div class="comparison-cards">
            <For each={props.products}>
              {(product, index) => (
                <div
                  class={`comparison-card ${removingIds().has(product.id) ? 'removing' : ''}`}
                  style={{
                    'animation-delay': `${index() * 0.1}s`
                  }}
                >
                  <button
                    class="remove-btn"
                    onClick={() => handleRemove(product.id)}
                    title="移除"
                  >
                    ×
                  </button>
                  <img
                    src={product.image}
                    alt={product.name}
                    class="product-image"
                  />
                  <div class="product-info">
                    <div class="product-name">{product.name}</div>
                    <div class="product-category">{product.category}</div>
                  </div>
                </div>
              )}
            </For>
          </div>
        )}
      </div>

      {props.products.length > 0 && (
        <button class="btn btn-secondary" onClick={props.onClear} style="align-self: flex-end">
          清空对比
        </button>
      )}
    </div>
  );
};

export default ComparisonZone;
