import { Component, createSignal, createEffect, Index } from 'solid-js';
import { Product } from '../types';

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const ProductModal: Component<ProductModalProps> = (props) => {
  const [name, setName] = createSignal('');
  const [category, setCategory] = createSignal('');
  const [image, setImage] = createSignal('');
  const [properties, setProperties] = createSignal<{ key: string; value: string }[]>([]);

  createEffect(() => {
    if (props.product) {
      setName(props.product.name);
      setCategory(props.product.category);
      setImage(props.product.image);
      const propsList = Object.entries(props.product.properties).map(([k, v]) => ({ key: k, value: v }));
      setProperties(propsList.length > 0 ? propsList : [{ key: '', value: '' }]);
    } else {
      setName('');
      setCategory('');
      setImage('');
      setProperties([{ key: '', value: '' }]);
    }
  });

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  const addProperty = () => {
    setProperties([...properties(), { key: '', value: '' }]);
  };

  const handleSave = () => {
    if (!name().trim()) {
      alert('请输入商品名称');
      return;
    }
    if (!category().trim()) {
      alert('请输入商品分类');
      return;
    }
    
    const validProperties: Record<string, string> = {};
    for (const prop of properties()) {
      if (prop.key.trim() && prop.value.trim()) {
        validProperties[prop.key.trim()] = prop.value.trim();
      }
    }
    
    props.onSave({
      name: name().trim(),
      category: category().trim(),
      image: image().trim() || 'https://via.placeholder.com/200',
      properties: validProperties
    });
    props.onClose();
  };

  return (
    <div class="modal-overlay" onClick={handleOverlayClick}>
      <div class="modal">
        <div class="modal-header">
          <h3>{props.product ? '编辑商品' : '添加商品'}</h3>
          <button class="modal-close" onClick={props.onClose}>×</button>
        </div>

        <div class="form-group">
          <label>商品名称</label>
          <input
            type="text"
            value={name()}
            onInput={(e) => setName(e.target.value)}
            placeholder="请输入商品名称"
          />
        </div>

        <div class="form-group">
          <label>商品分类</label>
          <input
            type="text"
            value={category()}
            onInput={(e) => setCategory(e.target.value)}
            placeholder="请输入商品分类"
          />
        </div>

        <div class="form-group">
          <label>商品图片URL</label>
          <input
            type="text"
            value={image()}
            onInput={(e) => setImage(e.target.value)}
            placeholder="请输入图片URL"
          />
        </div>

        <div class="form-group">
          <label>商品属性</label>
          <div class="properties-editor">
            <Index each={properties()}>
              {(prop, index) => (
                <div class="property-item">
                  <input
                    type="text"
                    value={prop().key}
                    onInput={(e) => {
                      const newProps = [...properties()];
                      newProps[index] = { ...newProps[index], key: e.target.value };
                      setProperties(newProps);
                    }}
                    placeholder="属性名"
                  />
                  <input
                    type="text"
                    value={prop().value}
                    onInput={(e) => {
                      const newProps = [...properties()];
                      newProps[index] = { ...newProps[index], value: e.target.value };
                      setProperties(newProps);
                    }}
                    placeholder="属性值"
                  />
                  <button
                    class="remove-property-btn"
                    onClick={() => {
                      if (properties().length > 1) {
                        setProperties(properties().filter((_, i) => i !== index));
                      }
                    }}
                    title="删除属性"
                  >
                    ×
                  </button>
                </div>
              )}
            </Index>
            <button class="add-property-btn" onClick={addProperty}>
              + 添加属性
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onClick={props.onClose}>
            取消
          </button>
          <button class="btn btn-primary" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
