import { useState } from 'react';

interface BillFormData {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description: string;
}

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BillFormData) => void;
}

const categories = {
  income: [
    { value: 'salary', label: '工资' },
    { value: 'bonus', label: '奖金' },
    { value: 'other', label: '其他收入' },
  ],
  expense: [
    { value: 'food', label: '餐饮' },
    { value: 'transport', label: '交通' },
    { value: 'shopping', label: '购物' },
    { value: 'entertainment', label: '娱乐' },
    { value: 'other', label: '其他支出' },
  ],
};

export default function AddBillModal({ isOpen, onClose, onSubmit }: AddBillModalProps) {
  const [formData, setFormData] = useState<BillFormData>({
    title: '',
    amount: 0,
    type: 'expense',
    category: 'food',
    date: new Date().toISOString().slice(0, 16),
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || formData.amount <= 0) return;
    onSubmit(formData);
    setFormData({
      title: '',
      amount: 0,
      type: 'expense',
      category: 'food',
      date: new Date().toISOString().slice(0, 16),
      description: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '24px',
        width: '100%',
        maxWidth: '400px',
        animation: 'modalIn 0.3s ease-out',
      }}>
        <style>{`
          @keyframes modalIn {
            0% { opacity: 0; transform: scale(0.9) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>
            添加账单
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: 0,
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type Toggle */}
          <div style={{
            display: 'flex',
            marginBottom: '20px',
            background: '#f3f4f6',
            borderRadius: '12px',
            padding: '4px',
          }}>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense', category: 'food' })}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '10px',
                background: formData.type === 'expense' ? '#f97316' : 'transparent',
                color: formData.type === 'expense' ? 'white' : '#6b7280',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              支出
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income', category: 'salary' })}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '10px',
                background: formData.type === 'income' ? '#22c55e' : 'transparent',
                color: formData.type === 'income' ? 'white' : '#6b7280',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              收入
            </button>
          </div>

          {/* Amount */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>
              金额
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 600,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = formData.type === 'income' ? '#22c55e' : '#f97316'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>
              标题
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例如：午餐"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = formData.type === 'income' ? '#22c55e' : '#f97316'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>
              分类
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              {categories[formData.type].map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>
              时间
            </label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>
              备注（可选）
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="添加备注..."
              rows={2}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              color: 'white',
              cursor: 'pointer',
              background: formData.type === 'income'
                ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                : 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
              boxShadow: formData.type === 'income'
                ? '0 4px 15px rgba(17, 153, 142, 0.4)'
                : '0 4px 15px rgba(249, 115, 22, 0.4)',
            }}
          >
            确认添加
          </button>
        </form>
      </div>
    </div>
  );
}
