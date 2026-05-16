import type { TopBarProps } from '@/types/layout';

export function TopBar({ menuItems, extraContent }: TopBarProps) {
  return (
    <div className="h-[35px] bg-[#1e1e1e] flex items-center justify-between border-b border-[#2d2d2d] select-none">
      <div className="flex items-center h-full">
        {menuItems.map((item) => (
          <div
            key={item}
            className="px-3 h-full flex items-center text-[#cccccc] text-sm cursor-pointer hover:bg-[#2a2a2a] transition-colors duration-100"
          >
            {item}
          </div>
        ))}
      </div>
      <div className="flex items-center h-full">
        {extraContent}
      </div>
    </div>
  );
}
