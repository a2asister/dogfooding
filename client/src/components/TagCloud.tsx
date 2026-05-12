import React, { useMemo } from 'react';
import type { Category } from '../types';

interface TagCloudProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (slug: string | null) => void;
}

const COLORS = [
  { bg: 'rgba(255, 107, 107, 0.2)', border: 'rgba(255, 107, 107, 0.6)', text: '#ff6b6b' },
  { bg: 'rgba(78, 205, 196, 0.2)', border: 'rgba(78, 205, 196, 0.6)', text: '#4ecdc4' },
  { bg: 'rgba(129, 199, 132, 0.2)', border: 'rgba(129, 199, 132, 0.6)', text: '#81c784' },
  { bg: 'rgba(255, 230, 109, 0.2)', border: 'rgba(255, 230, 109, 0.6)', text: '#ffe66d' },
  { bg: 'rgba(173, 127, 255, 0.2)', border: 'rgba(173, 127, 255, 0.6)', text: '#ad7fff' },
  { bg: 'rgba(100, 181, 246, 0.2)', border: 'rgba(100, 181, 246, 0.6)', text: '#64b5f6' },
  { bg: 'rgba(255, 171, 64, 0.2)', border: 'rgba(255, 171, 64, 0.6)', text: '#ffab40' },
  { bg: 'rgba(244, 143, 177, 0.2)', border: 'rgba(244, 143, 177, 0.6)', text: '#f48fb1' },
];

export default function TagCloud({
  categories,
  selectedCategory,
  onCategorySelect,
}: TagCloudProps) {
  const tagPositions = useMemo(() => {
    return categories.map((_, index) => ({
      animationDelay: `${index * 0.15}s`,
      colorIndex: index % COLORS.length,
      fontSize: 14 + Math.random() * 6,
    }));
  }, [categories]);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        maxWidth: 600,
        margin: '0 auto',
        padding: '20px 0',
      }}
    >
      <button
        onClick={() => onCategorySelect(null)}
        style={{
          padding: '10px 20px',
          fontSize: 14,
          fontWeight: 600,
          borderRadius: 20,
          border: '2px solid rgba(255, 255, 255, 0.3)',
          background: selectedCategory === null ? 'rgba(100, 150, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)',
          color: '#fff',
          cursor: 'pointer',
          transition: 'all 0.3s ease-out',
          transform: selectedCategory === null ? 'scale(1.1)' : 'scale(1)',
          animation: 'tagFloat 4s ease-in-out infinite',
          animationDelay: '0s',
          backdropFilter: 'blur(5px)',
        }}
        onMouseEnter={(e) => {
          if (selectedCategory !== null) {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.background = 'rgba(100, 150, 255, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (selectedCategory !== null) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }
        }}
      >
        全部课程
      </button>

      {categories.map((category, index) => {
        const isSelected = selectedCategory === category.slug;
        const color = COLORS[tagPositions[index]?.colorIndex ?? 0];
        const pos = tagPositions[index];

        return (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.slug)}
            style={{
              padding: '10px 20px',
              fontSize: pos.fontSize,
              fontWeight: isSelected ? 700 : 500,
              borderRadius: 20,
              border: `2px solid ${isSelected ? color.text : color.border}`,
              background: isSelected ? `${color.bg.replace('0.2', '0.5')}` : color.bg,
              color: color.text,
              cursor: 'pointer',
              transition: 'all 0.3s ease-out',
              transform: isSelected ? 'scale(1.15)' : 'scale(1)',
              animation: 'tagFloat 4s ease-in-out infinite',
              animationDelay: pos.animationDelay,
              backdropFilter: 'blur(5px)',
              boxShadow: isSelected
                ? `0 8px 30px ${color.bg.replace('0.2', '0.4')}`
                : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = `${color.bg.replace('0.2', '0.35')}`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = color.bg;
              }
            }}
          >
            {category.name}
            {category.courseCount !== undefined && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 11,
                  opacity: 0.7,
                }}
              >
                ({category.courseCount})
              </span>
            )}
          </button>
        );
      })}

      <style>{`
        @keyframes tagFloat {
          0%, 100% {
            transform: translateY(0) scale(var(--tag-scale, 1));
          }
          50% {
            transform: translateY(-8px) scale(var(--tag-scale, 1));
          }
        }
      `}</style>
    </div>
  );
}
