import type { StatusBarProps } from '@/types/layout';

export function StatusBar({ leftItems, rightItems }: StatusBarProps) {
  return (
    <div className="h-[22px] bg-[#007acc] flex items-center justify-between px-2 select-none shrink-0">
      <div className="flex items-center gap-3">
        {leftItems.map((item) => (
          <div
            key={item.id}
            onClick={item.onClick}
            className="flex items-center gap-1 text-xs text-white cursor-pointer hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors"
          >
            {item.icon && <span className="w-3 h-3">{item.icon}</span>}
            <span>{item.content}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {rightItems.map((item) => (
          <div
            key={item.id}
            onClick={item.onClick}
            className="flex items-center gap-1 text-xs text-white cursor-pointer hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors"
          >
            {item.icon && <span className="w-3 h-3">{item.icon}</span>}
            <span>{item.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
