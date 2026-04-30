import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, AlertTriangle, Droplets, MapPin, TrendingUp, Clock, Search, Bell, Menu, X } from 'lucide-react';
import { cn } from '../utils/cn';

const navItems = [
  { path: '/', icon: Activity, label: '实时监控', exact: true },
  { path: '/alert-management', icon: AlertTriangle, label: '预警管理' },
  { path: '/point-management', icon: MapPin, label: '点位管理' },
  { path: '/data-analysis', icon: TrendingUp, label: '数据分析' },
  { path: '/data-retrospective', icon: Search, label: '数据回溯' },
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const systemStatus = {
    onlinePoints: 6,
    totalPoints: 6,
    currentAlerts: 2,
    dataCollection: '正常',
  };

  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <header className="bg-dark-light border-b border-dark-light px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-dark rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Droplets className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">京杭大运河污染大屏监控系统</h1>
                <p className="text-slate-400 text-xs">Grand Canal Pollution Monitoring System</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-dark p-2 rounded-lg">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-mono">
                {currentTime.toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
            <Link 
              to="/alert-management" 
              className="relative p-2 hover:bg-dark rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {systemStatus.currentAlerts > 0 && (
                <span className="absolute top-1 right-1 w-5 h-2 flex items-center justify-center">
                  <span className="absolute w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="absolute w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold">
                      {systemStatus.currentAlerts > 9 ? '9+' : systemStatus.currentAlerts}
                    </span>
                  </span>
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-dark-light border-r border-dark-light transform transition-transform duration-300 ease-in-out',
          'pt-20 lg:pt-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">功能导航</h2>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, item.exact);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      active
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-dark text-slate-300 hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="p-4 border-t border-dark-light">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">系统状态</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">在线监测点</span>
                <span className="text-green-400">{systemStatus.onlinePoints}/{systemStatus.totalPoints}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">当前预警</span>
                <span className={cn(
                  systemStatus.currentAlerts > 0 ? 'text-yellow-400' : 'text-green-400'
                )}>
                  {systemStatus.currentAlerts}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">数据采集</span>
                <span className={cn(
                  systemStatus.dataCollection === '正常' ? 'text-green-400' : 'text-red-400'
                )}>
                  {systemStatus.dataCollection}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
