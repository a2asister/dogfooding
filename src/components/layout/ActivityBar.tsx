import type { ActivityBarProps } from '@/types/layout';

export function ActivityBar({ items, activeId, onSelect }: ActivityBarProps) {
  return (
    <div className="w-[48px] bg-[#1e1e1e] flex flex-col items-center pt-1 border-r border-[#2d2d2d] select-none">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`w-full h-[48px] flex items-center justify-center cursor-pointer transition-all duration-150 group relative ${
            activeId === item.id
              ? 'text-white border-l-2 border-[#007acc] bg-[#2a2a2a]'
              : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#252525]'
          }`}
          title={item.tooltip}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
}
