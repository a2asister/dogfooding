import { Home, BookOpen, HelpCircle, Settings, Zap, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: '主展示', icon: Home, description: '发电流程可视化' },
  { path: '/knowledge', label: '知识点', icon: BookOpen, description: '发电知识小百科' },
  { path: '/quiz', label: '趣味问答', icon: HelpCircle, description: '答题赢取勋章' },
  { path: '/settings', label: '设置', icon: Settings, description: '个性化设置' },
];

export function SidebarNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-72 h-full bg-white border-r border-border-light shadow-sm">
      <div className="p-6 border-b border-border-subtle bg-gradient-to-b from-primary-blue/5 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-blue to-primary-light-blue rounded-2xl flex items-center justify-center shadow-md">
            <Zap className="w-7 h-7 text-white" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-dark">火力发电</h1>
            <p className="text-sm text-text-medium">小课堂</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-6 overflow-y-auto">
        <p className="text-xs font-semibold text-text-light uppercase tracking-widest mb-6 px-3">
          功能导航
        </p>
        <div className="space-y-4">
          {navItems.map(({ path, label, icon: Icon, description }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-4 px-5 py-5 rounded-2xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-blue/15 to-primary-light-blue/15 text-primary-blue shadow-sm ring-1 ring-primary-blue/30'
                    : 'text-text-medium hover:bg-border-subtle hover:text-text-dark'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-primary-blue to-primary-light-blue text-white shadow-md'
                      : 'bg-border-subtle group-hover:bg-primary-blue/10 group-hover:text-primary-blue'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-white' : ''}`}
                    fill={isActive ? 'currentColor' : 'none'}
                  />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs opacity-70">{description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-5 border-t border-border-subtle">
        <div className="bg-gradient-to-br from-primary-orange/5 to-primary-light-orange/5 rounded-2xl p-5 border border-primary-orange/10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary-orange" fill="currentColor" />
            <p className="text-sm font-semibold text-text-dark">小贴士</p>
          </div>
          <p className="text-sm text-text-medium leading-relaxed">
            点击主展示页面的设备图标，可以查看每个发电设备的详细工作原理哦~
          </p>
        </div>
      </div>
    </aside>
  );
}
