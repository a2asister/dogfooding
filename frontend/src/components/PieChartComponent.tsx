import { useState, useEffect, useRef, useCallback } from 'react';
import { useAssetContext } from '../context/AssetContext';
import type { AssetCategory, SubCategory } from '../types/asset';

const easeOutElastic = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const polarToCartesian = (cx: number, cy: number, r: number, angle: number): { x: number; y: number } => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number, shrinkProgress: number = 0): string => {
  const adjustedRadius = r * (1 - shrinkProgress);
  const angleDiff = endAngle - startAngle;
  
  if (angleDiff >= 359.5) {
    return `M ${cx} ${cy - adjustedRadius} A ${adjustedRadius} ${adjustedRadius} 0 1 1 ${cx - 0.001} ${cy - adjustedRadius} Z`;
  }
  
  if (angleDiff < 0.1) {
    return `M ${cx} ${cy} Z`;
  }
  
  const start = polarToCartesian(cx, cy, adjustedRadius, endAngle);
  const end = polarToCartesian(cx, cy, adjustedRadius, startAngle);
  const largeArcFlag = angleDiff <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${adjustedRadius} ${adjustedRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`;
};

interface CategoryState {
  id: string;
  startAngle: number;
  targetAngle: number;
  currentAngle: number;
  shrinkProgress: number;
  isNew: boolean;
  isDeleting: boolean;
}

export default function PieChartComponent() {
  const { categories, isLoading } = useAssetContext();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [drilledCategory, setDrilledCategory] = useState<AssetCategory | null>(null);
  const [drillProgress, setDrillProgress] = useState(0);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: AssetCategory | SubCategory } | null>(null);
  const [categoryStates, setCategoryStates] = useState<Map<string, CategoryState>>(new Map());
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  const animationRef = useRef<number>();
  const prevCategoriesRef = useRef<AssetCategory[]>([]);

  const total = categories.reduce((sum, cat) => sum + cat.amount, 0);

  useEffect(() => {
    if (isLoading || categories.length === 0) return;

    const prevCategories = prevCategoriesRef.current;
    const prevIds = new Set(prevCategories.map(c => c.id));
    const currIds = new Set(categories.map(c => c.id));

    const addedIds = [...currIds].filter(id => !prevIds.has(id));
    const deletedIds = [...prevIds].filter(id => !currIds.has(id));
    const existingIds = [...currIds].filter(id => prevIds.has(id));

    if (!initialLoadDone && prevCategories.length === 0) {
      const newStates = new Map<string, CategoryState>();
      let currentAngle = 0;
      categories.forEach(category => {
        const angle = (category.amount / total) * 360;
        newStates.set(category.id, {
          id: category.id,
          startAngle: currentAngle,
          targetAngle: currentAngle + angle,
          currentAngle: currentAngle,
          shrinkProgress: 0,
          isNew: true,
          isDeleting: false,
        });
        currentAngle += angle;
      });
      setCategoryStates(newStates);

      const startTime = Date.now();
      const duration = 2500;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutElastic(progress);

        setCategoryStates(prev => {
          const updated = new Map(prev);
          let startAngle = 0;
          categories.forEach(category => {
            const state = updated.get(category.id);
            if (state) {
              const targetEndAngle = startAngle + (category.amount / total) * 360;
              state.startAngle = startAngle;
              state.targetAngle = targetEndAngle;
              state.currentAngle = startAngle + (targetEndAngle - startAngle) * easedProgress;
              state.isNew = false;
              startAngle = targetEndAngle;
            }
          });
          return updated;
        });

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setInitialLoadDone(true);
        }
      };

      setTimeout(() => {
        animationRef.current = requestAnimationFrame(animate);
      }, 50);

      prevCategoriesRef.current = categories;
      return;
    }

    if (addedIds.length > 0 || deletedIds.length > 0 || existingIds.length > 0) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      const newStates = new Map<string, CategoryState>();

      let currentAngle = 0;
      categories.forEach(category => {
        const angle = (category.amount / total) * 360;
        const isNew = addedIds.includes(category.id);
        const prevState = categoryStates.get(category.id);
        
        newStates.set(category.id, {
          id: category.id,
          startAngle: prevState ? prevState.startAngle : currentAngle,
          targetAngle: currentAngle + angle,
          currentAngle: prevState ? prevState.currentAngle : currentAngle,
          shrinkProgress: 0,
          isNew,
          isDeleting: false,
        });
        currentAngle += angle;
      });

      deletedIds.forEach(id => {
        const prevState = categoryStates.get(id);
        if (prevState) {
          newStates.set(id, {
            ...prevState,
            isDeleting: true,
            shrinkProgress: 0,
          });
        }
      });

      setCategoryStates(newStates);

      const startTime = Date.now();
      const duration = 800;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);

        setCategoryStates(prev => {
          const updated = new Map(prev);
          
          let targetStartAngle = 0;
          updated.forEach((state, id) => {
            if (!state.isDeleting) {
              const category = categories.find(c => c.id === id);
              if (category) {
                const targetEndAngle = targetStartAngle + (category.amount / total) * 360;
                
                state.startAngle = state.startAngle + (targetStartAngle - state.startAngle) * easedProgress;
                state.targetAngle = targetEndAngle;
                state.currentAngle = state.currentAngle + (targetEndAngle - state.currentAngle) * easedProgress;
                
                targetStartAngle = targetEndAngle;
              }
            }
          });
          
          updated.forEach((state, id) => {
            if (state.isDeleting) {
              state.shrinkProgress = easedProgress;
            }
          });

          return updated;
        });

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setCategoryStates(prev => {
            const updated = new Map(prev);
            deletedIds.forEach(id => updated.delete(id));
            
            let finalStartAngle = 0;
            updated.forEach((state, id) => {
              const category = categories.find(c => c.id === id);
              if (category) {
                const finalEndAngle = finalStartAngle + (category.amount / total) * 360;
                state.startAngle = finalStartAngle;
                state.currentAngle = finalEndAngle;
                finalStartAngle = finalEndAngle;
              }
            });
            
            return updated;
          });
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    prevCategoriesRef.current = categories;

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [categories, isLoading]);

  const handleDrillDown = useCallback((category: AssetCategory) => {
    if (drilledCategory?.id === category.id) {
      setDrilledCategory(null);
      animateDrill(0);
    } else {
      setDrilledCategory(category);
      animateDrill(1);
    }
    setHoveredId(null);
    setTooltip(null);
  }, [drilledCategory]);

  const animateDrill = (target: number) => {
    const startTime = Date.now();
    const duration = 500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDrillProgress(target === 1 ? easeOutCubic(progress) : 1 - easeOutCubic(progress));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleHover = (category: AssetCategory, event: React.MouseEvent<SVGPathElement>) => {
    setHoveredId(category.id);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top,
      data: category,
    });
  };

  const handleLeave = () => {
    setHoveredId(null);
    setTooltip(null);
  };

  const renderSlices = () => {
    const cx = 300;
    const cy = 300;
    const baseRadius = 120;
    const hoverOffset = 20;

    if (drilledCategory && drillProgress > 0) {
      const subTotal = drilledCategory.subCategories.reduce((sum, sub) => sum + sub.amount, 0);
      let currentAngle = 0;

      return drilledCategory.subCategories.map((sub, index) => {
        const angle = (sub.amount / subTotal) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle += angle;

        const expandedRadius = baseRadius + drillProgress * 80;
        const path = describeArc(cx, cy, expandedRadius, startAngle, endAngle);

        return (
          <path
            key={sub.id}
            d={path}
            fill={drilledCategory.color}
            opacity={0.4 + (index / drilledCategory.subCategories.length) * 0.6}
            style={{
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
          />
        );
      });
    }

    const allStates = Array.from(categoryStates.entries());
    
    return allStates.map(([id, state]) => {
      const category = categories.find(c => c.id === id);
      if (!category) return null;

      const isHovered = hoveredId === id;
      const radius = baseRadius + (isHovered ? hoverOffset : 0);
      const opacity = hoveredId ? (isHovered ? 1 : 0.5) : 1;

      const path = describeArc(cx, cy, radius, state.startAngle, state.currentAngle, state.shrinkProgress);

      return (
        <path
          key={id}
          d={path}
          fill={category.color}
          opacity={opacity * (1 - state.shrinkProgress)}
          style={{
            transition: 'opacity 0.1s ease',
            cursor: 'pointer',
            filter: isHovered ? 'brightness(1.1)' : 'none',
          }}
          onMouseEnter={(e) => handleHover(category, e)}
          onMouseLeave={handleLeave}
          onClick={() => handleDrillDown(category)}
        />
      );
    });
  };

  const renderLegend = () => {
    if (drilledCategory && drillProgress > 0.5) {
      const subTotal = drilledCategory.subCategories.reduce((sum, sub) => sum + sub.amount, 0);
      return (
        <div className="legend" style={{ opacity: drillProgress }}>
          <h3>{drilledCategory.name} 明细</h3>
          <button className="back-btn" onClick={() => handleDrillDown(drilledCategory)}>
            返回
          </button>
          {drilledCategory.subCategories.map((sub) => (
            <div key={sub.id} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: drilledCategory.color, opacity: 0.4 + (drilledCategory.subCategories.indexOf(sub) / drilledCategory.subCategories.length) * 0.6 }}
              />
              <span className="legend-name">{sub.name}</span>
              <span className="legend-value">¥{sub.amount.toLocaleString()}</span>
              <span className="legend-percent">{((sub.amount / subTotal) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="legend" style={{ opacity: 1 - drillProgress * 0.5 }}>
        {categories.map((category) => (
          <div
            key={category.id}
            className={`legend-item ${hoveredId === category.id ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredId(category.id)}
            onMouseLeave={handleLeave}
          >
            <div className="legend-color" style={{ backgroundColor: category.color }} />
            <span className="legend-name">{category.name}</span>
            <span className="legend-value">¥{category.amount.toLocaleString()}</span>
            <span className="legend-percent">{((category.amount / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
        <div className="legend-total">
          <strong>总计: ¥{total.toLocaleString()}</strong>
        </div>
      </div>
    );
  };

  return (
    <div className="pie-chart-container">
      <div className="chart-wrapper">
        <svg width="600" height="600" viewBox="0 0 600 600">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3" />
            </filter>
          </defs>
          <g filter="url(#shadow)">
            {renderSlices()}
          </g>
          <circle cx="300" cy="300" r="50" fill="white" />
          <text x="300" y="295" textAnchor="middle" fontSize="14" fill="#6b7280">总资产</text>
          <text x="300" y="320" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1f2937">
            ¥{total.toLocaleString()}
          </text>
        </svg>
      </div>
      {renderLegend()}
      {tooltip && (
        <div
          className="tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y - 10,
            transform: 'translateX(-50%) translateY(-100%)',
          }}
        >
          <div className="tooltip-title">{tooltip.data.name}</div>
          <div className="tooltip-value">¥{tooltip.data.amount.toLocaleString()}</div>
          <div className="tooltip-percent">{((tooltip.data.amount / total) * 100).toFixed(1)}%</div>
        </div>
      )}
      <style jsx>{`
        .pie-chart-container {
          display: flex;
          gap: 3rem;
          align-items: flex-start;
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .chart-wrapper {
          flex-shrink: 0;
        }
        
        .legend {
          min-width: 280px;
          transition: opacity 0.3s ease;
        }
        
        .legend h3 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1.25rem;
        }
        
        .back-btn {
          margin-bottom: 1rem;
          padding: 0.5rem 1rem;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.2s;
        }
        
        .back-btn:hover {
          background: #4f46e5;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .legend-item.hovered {
          background: #f3f4f6;
          transform: translateX(4px);
        }
        
        .legend-item:hover {
          background: #f9fafb;
        }
        
        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        
        .legend-name {
          flex: 1;
          font-weight: 500;
          color: #374151;
        }
        
        .legend-value {
          color: #1f2937;
          font-weight: 600;
        }
        
        .legend-percent {
          color: #6b7280;
          font-size: 0.875rem;
          min-width: 50px;
          text-align: right;
        }
        
        .legend-total {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
          text-align: right;
          font-size: 1.125rem;
          color: #1f2937;
        }
        
        .tooltip {
          position: fixed;
          background: #1f2937;
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          z-index: 1000;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .tooltip::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #1f2937;
        }
        
        .tooltip-title {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        
        .tooltip-value {
          font-size: 1rem;
          margin-bottom: 0.125rem;
        }
        
        .tooltip-percent {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
