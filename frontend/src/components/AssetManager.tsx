import { useState } from 'react';
import { useAssetContext } from '../context/AssetContext';
import type { AssetCategory, SubCategory } from '../types/asset';

export default function AssetManager() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
  } = useAssetContext();
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#3B82F6', amount: 0 });
  const [subFormData, setSubFormData] = useState({ name: '', amount: 0 });
  const [editingSubId, setEditingSubId] = useState<{ categoryId: string; subId: string } | null>(null);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addCategory(formData);
    if (success) {
      setShowAddForm(false);
      setFormData({ name: '', color: '#3B82F6', amount: 0 });
    }
  };

  const handleUpdateCategory = async (id: string) => {
    const success = await updateCategory(id, formData);
    if (success) {
      setEditingId(null);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return;
    await deleteCategory(id);
  };

  const handleAddSubCategory = async (categoryId: string) => {
    const success = await addSubCategory(categoryId, subFormData);
    if (success) {
      setSubFormData({ name: '', amount: 0 });
    }
  };

  const handleUpdateSubCategory = async (categoryId: string, subId: string) => {
    const success = await updateSubCategory(categoryId, subId, subFormData);
    if (success) {
      setEditingSubId(null);
    }
  };

  const handleDeleteSubCategory = async (categoryId: string, subId: string) => {
    if (!confirm('确定要删除这个子分类吗？')) return;
    await deleteSubCategory(categoryId, subId);
  };

  const startEdit = (category: AssetCategory) => {
    setEditingId(category.id);
    setFormData({ name: category.name, color: category.color, amount: category.amount });
  };

  const startEditSub = (categoryId: string, sub: SubCategory) => {
    setEditingSubId({ categoryId, subId: sub.id });
    setSubFormData({ name: sub.name, amount: sub.amount });
  };

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];

  return (
    <div className="asset-manager">
      <div className="manager-header">
        <h2>资产管理</h2>
        <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '取消' : '+ 添加分类'}
        </button>
      </div>

      {showAddForm && (
        <form className="add-form" onSubmit={handleAddCategory}>
          <h3>添加新分类</h3>
          <div className="form-group">
            <label>分类名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>颜色</label>
            <div className="color-picker">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>
          <button type="submit" className="submit-btn">确认添加</button>
        </form>
      )}

      <div className="categories-list">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <div className="category-header">
              <div className="category-info">
                <div className="category-color" style={{ backgroundColor: category.color }} />
                <div>
                  <h3>{category.name}</h3>
                  <p className="category-amount">¥{category.amount.toLocaleString()}</p>
                </div>
              </div>
              <div className="category-actions">
                <button className="icon-btn" onClick={() => startEdit(category)} title="编辑">
                  ✏️
                </button>
                <button className="icon-btn" onClick={() => handleDeleteCategory(category.id)} title="删除">
                  🗑️
                </button>
                <button
                  className="icon-btn"
                  onClick={() => setExpandedId(expandedId === category.id ? null : category.id)}
                  title={expandedId === category.id ? '收起' : '展开子分类'}
                >
                  {expandedId === category.id ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {editingId === category.id && (
              <div className="edit-form">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <div className="color-picker">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
                <button className="small-btn" onClick={() => handleUpdateCategory(category.id)}>保存</button>
                <button className="small-btn cancel" onClick={() => setEditingId(null)}>取消</button>
              </div>
            )}

            {expandedId === category.id && (
              <div className="subcategories">
                <h4>子分类</h4>
                {category.subCategories.map((sub) => (
                  <div key={sub.id} className="subcategory-item">
                    {editingSubId?.categoryId === category.id && editingSubId?.subId === sub.id ? (
                      <div className="sub-edit-form">
                        <input
                          type="text"
                          value={subFormData.name}
                          onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                        />
                        <input
                          type="number"
                          value={subFormData.amount}
                          onChange={(e) => setSubFormData({ ...subFormData, amount: Number(e.target.value) })}
                        />
                        <button className="tiny-btn" onClick={() => handleUpdateSubCategory(category.id, sub.id)}>
                          保存
                        </button>
                        <button className="tiny-btn cancel" onClick={() => setEditingSubId(null)}>
                          取消
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="sub-name">{sub.name}</span>
                        <span className="sub-amount">¥{sub.amount.toLocaleString()}</span>
                        <div className="sub-actions">
                          <button className="tiny-btn" onClick={() => startEditSub(category.id, sub)}>
                            ✏️
                          </button>
                          <button className="tiny-btn" onClick={() => handleDeleteSubCategory(category.id, sub.id)}>
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <div className="add-sub-form">
                  <input
                    type="text"
                    placeholder="子分类名称"
                    value={subFormData.name}
                    onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="金额"
                    value={subFormData.amount || ''}
                    onChange={(e) => setSubFormData({ ...subFormData, amount: Number(e.target.value) })}
                  />
                  <button
                    className="small-btn"
                    onClick={() => handleAddSubCategory(category.id)}
                    disabled={!subFormData.name}
                  >
                    添加
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .asset-manager {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-height: 80vh;
          overflow-y: auto;
        }
        
        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .manager-header h2 {
          margin: 0;
          color: #1f2937;
          font-size: 1.25rem;
        }
        
        .add-btn {
          padding: 0.5rem 1rem;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }
        
        .add-btn:hover {
          background: #4f46e5;
        }
        
        .add-form, .edit-form {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        
        .add-form h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: #374151;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }
        
        .form-group input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
        }
        
        .color-picker {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .color-option {
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .color-option:hover {
          transform: scale(1.1);
        }
        
        .color-option.selected {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.4);
        }
        
        .submit-btn {
          width: 100%;
          padding: 0.625rem;
          background: #10B981;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }
        
        .submit-btn:hover {
          background: #059669;
        }
        
        .categories-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .category-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.875rem;
          background: #f9fafb;
        }
        
        .category-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .category-color {
          width: 24px;
          height: 24px;
          border-radius: 6px;
        }
        
        .category-info h3 {
          margin: 0;
          font-size: 0.9375rem;
          color: #1f2937;
        }
        
        .category-amount {
          margin: 0;
          font-size: 0.8125rem;
          color: #6b7280;
        }
        
        .category-actions {
          display: flex;
          gap: 0.25rem;
        }
        
        .icon-btn {
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        
        .icon-btn:hover {
          background: #e5e7eb;
        }
        
        .edit-form {
          padding: 0.875rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }
        
        .edit-form input {
          flex: 1;
          min-width: 100px;
          padding: 0.375rem 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }
        
        .small-btn {
          padding: 0.375rem 0.75rem;
          background: #10B981;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8125rem;
        }
        
        .small-btn.cancel {
          background: #6b7280;
        }
        
        .small-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .subcategories {
          padding: 0.875rem;
          border-top: 1px solid #e5e7eb;
          background: white;
        }
        
        .subcategories h4 {
          margin: 0 0 0.75rem 0;
          font-size: 0.8125rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .subcategory-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: #f9fafb;
          border-radius: 6px;
          margin-bottom: 0.5rem;
        }
        
        .sub-name {
          flex: 1;
          font-size: 0.875rem;
          color: #374151;
        }
        
        .sub-amount {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1f2937;
        }
        
        .sub-actions {
          display: flex;
          gap: 0.25rem;
        }
        
        .tiny-btn {
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .tiny-btn:hover {
          background: #e5e7eb;
        }
        
        .sub-edit-form {
          display: flex;
          gap: 0.5rem;
          width: 100%;
          align-items: center;
        }
        
        .sub-edit-form input {
          flex: 1;
          min-width: 60px;
          padding: 0.25rem 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.8125rem;
        }
        
        .add-sub-form {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px dashed #e5e7eb;
        }
        
        .add-sub-form input {
          flex: 1;
          min-width: 60px;
          padding: 0.375rem 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.8125rem;
        }
      `}</style>
    </div>
  );
}
