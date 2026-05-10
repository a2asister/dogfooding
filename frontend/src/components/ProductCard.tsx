import { Component, createSignal } from 'solid-js';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onDragStart: (e: DragEvent, productId: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const ProductCard: Component<ProductCardProps> = (props) => {
  const [imageError, setImageError] = createSignal(false);
  
  return (
    <div
      class={`product-card ${props.isDragging ? 'dragging' : ''}`}
      draggable={true}
      onDragStart={(e) => props.onDragStart(e, props.product.id)}
      onDragEnd={props.onDragEnd}
    >
      <img
        src={props.product.image}
        alt={props.product.name}
        class="product-image"
        onError={() => setImageError(true)}
        style={imageError() ? "display: none" : "display: block"}
      />
      {imageError() && (
        <div class="product-image" style="display: flex; align-items: center; justify-content: center; background: #e8e8f0">
          <span style="color: #999; font-size: 0.9rem">图片加载失败</span>
        </div>
      )}
      <div class="product-info">
        <div class="product-name">{props.product.name}</div>
        <div class="product-category">{props.product.category}</div>
      </div>
      <div class="product-actions">
        <button class="btn btn-secondary" onClick={() => props.onEdit(props.product)}>
          编辑
        </button>
        <button class="btn btn-danger" onClick={() => props.onDelete(props.product)}>
          删除
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
