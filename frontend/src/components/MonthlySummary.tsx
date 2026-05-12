import { useState } from 'react';

interface Summary {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryBreakdown: Record<string, number>;
}

const categoryColors: Record<string, string> = {
  food: '#ff6b6b',
  transport: '#4ecdc4',
  shopping: '#ffe66d',
  entertainment: '#a855f7',
  salary: '#22c55e',
  bonus: '#f59e0b',
  other: '#6b7280',
};

const categoryNames: Record<string, string> = {
  food: '餐饮',
  transport: '交通',
  shopping: '购物',
  entertainment: '娱乐',
  salary: '工资',
  bonus: '奖金',
  other: '其他',
};

export default function MonthlySummary({ summary }: { summary: Summary }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const total = Object.values(summary.categoryBreakdown).reduce((a, b) => a + b, 0);
  const categories = Object.entries(summary.categoryBreakdown)
    .map(([key, value]) => ({
      name: categoryNames[key] || key,
      value,
      color: categoryColors[key] || '#6b7280',
      percentage: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: '20px',
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
            本月汇总
          </h3>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: summary.balance >= 0 ? '#22c55e' : '#ef4444',
            marginTop: '4px',
          }}>
            ¥{summary.balance.toFixed(2)}
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.3s ease',
          }}
        >
          ▼
        </button>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #f3f4f6',
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>收入</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#22c55e' }}>
            +¥{summary.totalIncome.toFixed(2)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>支出</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#f97316' }}>
            -¥{summary.totalExpense.toFixed(2)}
          </div>
        </div>
      </div>

      {isExpanded && categories.length > 0 && (
        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #f3f4f6',
        }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#374151' }}>
            支出分类占比
          </h4>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Mini Pie Chart */}
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
              <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                {(() => {
                  let cumulativePercent = 0;
                  return categories.map((cat, i) => {
                    const startPercent = cumulativePercent;
                    cumulativePercent += cat.percentage;
                    const largeArcFlag = cat.percentage > 50 ? 1 : 0;
                    
                    const x1 = 50 + 40 * Math.cos((startPercent / 100) * 2 * Math.PI);
                    const y1 = 50 + 40 * Math.sin((startPercent / 100) * 2 * Math.PI);
                    const x2 = 50 + 40 * Math.cos((cumulativePercent / 100) * 2 * Math.PI);
                    const y2 = 50 + 40 * Math.sin((cumulativePercent / 100) * 2 * Math.PI);

                    const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                    
                    return (
                      <path
                        key={i}
                        d={pathData}
                        fill={cat.color}
                        style={{
                          animation: `pieSlice 0.8s ease-out ${i * 0.1}s both`,
                          transformOrigin: '50% 50%',
                        }}
                      />
                    );
                  });
                })()}
                <circle cx="50" cy="50" r="25" fill="white" />
              </svg>
              <style>{`
                @keyframes pieSlice {
                  0% { opacity: 0; transform: scale(0); }
                  100% { opacity: 1; transform: scale(1); }
                }
              `}</style>
            </div>

            {/* Legend */}
            <div style={{ flex: 1 }}>
              {categories.map((cat, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      background: cat.color,
                    }} />
                    <span style={{ fontSize: '13px', color: '#4b5563' }}>{cat.name}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
