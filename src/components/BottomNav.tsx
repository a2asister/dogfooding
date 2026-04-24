import { Home, BookOpen, HelpCircle, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: '主展示', icon: Home },
  { path: '/knowledge', label: '知识点', icon: BookOpen },
  { path: '/quiz', label: '问答', icon: HelpCircle },
  { path: '/settings', label: '设置', icon: Settings },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border-light shadow-xl z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center flex-1 h-full px-2 py-2 transition-all duration-300 ${
                isActive
                  ? 'text-primary-blue'
                  : 'text-text-light hover:text-primary-light-blue'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1 transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-primary-blue/15 to-primary-light-blue/15'
                    : ''
                }`}
              >
                <Icon
                  className={`w-6 h-6 transition-transform duration-300 ${
                    isActive ? 'scale-110' : ''
                  }`}
                  fill={isActive ? 'currentColor' : 'none'}
                />
              </div>
              <span className={`text-xs font-semibold transition-all duration-300 ${
                isActive ? 'text-primary-blue' : ''
              }`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
