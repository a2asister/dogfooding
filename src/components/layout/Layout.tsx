import { Files, Search, GitBranch, Blocks, Settings } from 'lucide-react';
import { TopBar } from './TopBar';
import { ActivityBar } from './ActivityBar';
import { Sidebar } from './Sidebar';
import { EditorArea, EditorWelcome } from './EditorArea';
import { StatusBar } from './StatusBar';
import { useLayout } from '@/hooks/useLayout';
import type { LayoutProps, ActivityItem, StatusBarItem } from '@/types/layout';

const menuItems = ['文件', '编辑', '查看', '终端', '帮助'];

const activityItems: ActivityItem[] = [
  { id: 'explorer', icon: <Files size={24} />, tooltip: '资源管理器' },
  { id: 'search', icon: <Search size={24} />, tooltip: '搜索' },
  { id: 'git', icon: <GitBranch size={24} />, tooltip: '源代码管理' },
  { id: 'extensions', icon: <Blocks size={24} />, tooltip: '扩展' },
  { id: 'settings', icon: <Settings size={24} />, tooltip: '设置' },
];

const panelTitles: Record<string, string> = {
  explorer: '资源管理器',
  search: '搜索',
  git: '源代码管理',
  extensions: '扩展',
  settings: '设置',
};

const statusLeftItems: StatusBarItem[] = [
  { id: 'branch', content: 'main', icon: <GitBranch size={12} /> },
  { id: 'errors', content: '0 错误' },
  { id: 'warnings', content: '0 警告' },
];

const statusRightItems: StatusBarItem[] = [
  { id: 'encoding', content: 'UTF-8' },
  { id: 'eol', content: 'LF' },
  { id: 'lang', content: 'Plain Text' },
  { id: 'position', content: 'Ln 1, Col 1' },
];

export function Layout({ sidebarContent, editorContent, terminalContent, topBarExtra }: LayoutProps) {
  const { sidebarCollapsed, activePanel, sidebarWidth, toggleSidebar, selectPanel } = useLayout();

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] overflow-hidden min-w-[800px]">
      <TopBar menuItems={menuItems} extraContent={topBarExtra} />

      <div className="flex-1 flex overflow-hidden">
        <ActivityBar items={activityItems} activeId={activePanel} onSelect={selectPanel} />

        <Sidebar
          title={panelTitles[activePanel] || '资源管理器'}
          collapsed={sidebarCollapsed}
          width={sidebarWidth}
          onToggle={toggleSidebar}
        >
          {sidebarContent || (
            <div className="p-4 text-xs text-[#858585]">
              <p>侧边栏内容插槽</p>
              <p className="mt-2">预留位置：文件树、搜索结果等</p>
            </div>
          )}
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorArea>
            {editorContent || <EditorWelcome />}
          </EditorArea>

          {terminalContent && (
            <div className="h-[200px] border-t border-[#2d2d2d] bg-[#1e1e1e]">
              {terminalContent}
            </div>
          )}
        </div>
      </div>

      <StatusBar leftItems={statusLeftItems} rightItems={statusRightItems} />
    </div>
  );
}
