import { useState, useRef } from 'react';
import Confetti from './Confetti';

interface Bill {
  id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description?: string;
}

interface BillCardProps {
  bill: Bill;
  isNew: boolean;
  isDeleting: boolean;
  onDelete: (id: number) => void;
}

const categoryIcons: Record<string, string> = {
  food: '🍔',
  transport: '🚗',
  shopping: '🛒',
  entertainment: '🎮',
  salary: '💼',
  bonus: '🎁',
  other: '📦',
};

const categoryColors: Record<string, string> = {
  food: '#ff6b6b',
  transport: '#4ecdc4',
  shopping: '#ffe66d',
  entertainment: '#a855f7',
  salary: '#22c55e',
  bonus: '#f59e0b',
  other: '#6b7280',
};

const DELETE_THRESHOLD = -80;
const DELETE_BUTTON_WIDTH = 80;

export default function BillCard({ bill, isNew, isDeleting, onDelete }: BillCardProps) {
  const [startX, setStartX] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(x);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = x - startX;
    setOffset(Math.max(diff, -DELETE_BUTTON_WIDTH));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offset <= DELETE_THRESHOLD) {
      setOffset(-DELETE_BUTTON_WIDTH);
    } else {
      setOffset(0);
    }
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfetti(true);
    setTimeout(() => onDelete(bill.id), 300);
  };

  const handleCancelSwipe = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOffset(0);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
    };
  };

  const dateInfo = formatDate(bill.date);
  const isIncome = bill.type === 'income';
  const isSwipeOpen = offset <= DELETE_THRESHOLD;

  return (
    <div style={{ position: 'relative', marginBottom: '16px' }}>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px ${categoryColors[bill.category] || '#6b7280'}, 0 0 10px ${categoryColors[bill.category] || '#6b7280'}; }
          50% { box-shadow: 0 0 15px ${categoryColors[bill.category] || '#6b7280'}, 0 0 30px ${categoryColors[bill.category] || '#6b7280'}; }
        }
        @keyframes slide-in {
          0% { transform: translateX(100%); opacity: 0; }
          60% { transform: translateX(-10px); }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes collapse {
          0% { transform: scaleY(1); opacity: 1; height: auto; }
          100% { transform: scaleY(0); opacity: 0; height: 0; margin: 0; }
        }
        .pulse-dot { animation: pulse-glow 2s infinite; }
        .slide-in { animation: slide-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .collapse { animation: collapse 0.5s ease-out forwards; transform-origin: top; }
      `}</style>

      {/* Timeline line */}
      <div style={{
        position: 'absolute',
        left: '48px',
        top: 0,
        bottom: '-16px',
        width: '2px',
        background: 'rgba(255,255,255,0.3)',
        zIndex: 0,
      }} />

      {/* Date label - 左侧 */}
      <div style={{
        position: 'absolute',
        left: '0',
        top: '18px',
        width: '40px',
        textAlign: 'center',
        zIndex: 1,
      }}>
        <div style={{ color: 'white', fontWeight: 700, fontSize: '18px', lineHeight: '1' }}>
          {dateInfo.day}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '2px' }}>
          {dateInfo.month}月
        </div>
      </div>

      {/* Timeline dot with pulse - 在日期右侧 */}
      <div
        className={isNew ? 'pulse-dot' : ''}
        style={{
          position: 'absolute',
          left: '40px',
          top: '22px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: categoryColors[bill.category] || '#6b7280',
          border: '3px solid white',
          zIndex: 2,
          boxShadow: isNew ? undefined : '0 2px 8px rgba(0,0,0,0.2)',
        }}
      />

      {/* Card wrapper - 保持固定位置，不随滑动移动 */}
      <div
        style={{
          position: 'relative',
          marginLeft: '68px',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        {/* Action buttons background - 在卡片下方 */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: DELETE_BUTTON_WIDTH,
          display: 'flex',
          alignItems: 'stretch',
        }}>
          {/* Cancel button */}
          <button
            onClick={handleCancelSwipe}
            style={{
              width: '44px',
              background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
              border: 'none',
              color: 'white',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              opacity: isSwipeOpen ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
          >
            <span style={{ fontSize: '16px' }}>↩</span>
            取消
          </button>
          
          {/* Delete button */}
          <button
            onClick={handleConfirmDelete}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              borderRadius: '0 16px 16px 0',
            }}
          >
            <span style={{ fontSize: '18px' }}>🗑</span>
            删除
          </button>
        </div>

        {/* Card content - 这部分才滑动 */}
        <div
          ref={cardRef}
          className={`${isNew ? 'slide-in' : ''} ${isDeleting ? 'collapse' : ''}`}
          style={{
            position: 'relative',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transform: `translateX(${offset}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            cursor: 'grab',
            userSelect: 'none',
          }}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {showConfetti && <Confetti />}
          
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>{categoryIcons[bill.category] || '📦'}</span>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                    {bill.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                    {dateInfo.time}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: isIncome ? '#22c55e' : '#f97316',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  justifyContent: 'flex-end',
                }}>
                  {isIncome ? '↑' : '↓'}
                  ¥{bill.amount.toFixed(2)}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '4px',
                }}>
                  {isIncome ? '收入' : '支出'}
                </div>
              </div>
            </div>
            
            {bill.description && (
              <p style={{
                fontSize: '13px',
                color: '#9ca3af',
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: '1px solid #f3f4f6',
                marginBottom: 0,
              }}>
                {bill.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
