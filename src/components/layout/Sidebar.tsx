import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SidebarProps } from '@/types/layout';

export function Sidebar({ title, collapsed, width, onToggle, children }: SidebarProps) {
  return (
    <div
      className={`h-full bg-[#252526] border-r border-[#2d2d2d] flex flex-col transition-all duration-200 ease-in-out overflow-hidden ${
        collapsed ? 'w-0 border-r-0' : ''
      }`}
      style={{ width: collapsed ? 0 : width }}
    >
      <div className="h-[35px] flex items-center justify-between px-3 border-b border-[#2d2d2d] shrink-0">
        <span className="text-[11px] font-semibold text-[#cccccc] uppercase tracking-wider">
          {title}
        </span>
        <button
          onClick={onToggle}
          className="p-1 text-[#858585] hover:text-[#cccccc] transition-colors cursor-pointer"
          title={collapsed ? '展开侧边栏' : '折叠侧边栏'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
