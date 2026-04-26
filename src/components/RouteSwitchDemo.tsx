import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  MapPin, 
  ArrowRight,
  ChevronRight,
  Globe
} from 'lucide-react';
import { useAnimation } from '../contexts/AnimationContext';
import { SUB_APPS } from '../types';
import { useState } from 'react';

const routes = [
  { path: '/', name: '首页', app: null, icon: <Globe className="w-4 h-4" /> },
  { path: '/app1', name: '商品中心', app: 'app1', icon: <ChevronRight className="w-4 h-4" /> },
  { path: '/app1/list', name: '商品列表', app: 'app1', icon: <ChevronRight className="w-4 h-4" /> },
  { path: '/app1/detail/123', name: '商品详情', app: 'app1', icon: <ChevronRight className="w-4 h-4" /> },
  { path: '/app2', name: '订单系统', app: 'app2', icon: <ChevronRight className="w-4 h-4" /> },
  { path: '/app2/orders', name: '我的订单', app: 'app2', icon: <ChevronRight className="w-4 h-4" /> },
  { path: '/app3', name: '用户中心', app: 'app3', icon: <ChevronRight className="w-4 h-4" /> },
];

export function RouteSwitchDemo() {
  const { state, setActiveApp } = useAnimation();
  const [selectedRoute, setSelectedRoute] = useState<string>('/');

  const handleRouteClick = (route: typeof routes[0]) => {
    setSelectedRoute(route.path);
    if (route.app) {
      setActiveApp(route.app);
    } else {
      setActiveApp(null);
    }
  };

  const activeApp = state.activeApp;
  const activeAppData = SUB_APPS.find(a => a.id === activeApp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
    >
      <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
        <Navigation className="w-4 h-4" />
        路由切换演示
      </h3>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-slate-400">当前路由</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-slate-500 text-sm">http://localhost</span>
              <motion.span
                key={selectedRoute}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-indigo-400 font-mono text-sm font-medium"
              >
                {selectedRoute}
              </motion.span>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">路由列表（点击切换）</span>
            </div>
            <div className="space-y-1.5">
              {routes.map((route) => {
                const isSelected = selectedRoute === route.path;
                const appData = route.app ? SUB_APPS.find(a => a.id === route.app) : null;
                
                return (
                  <motion.button
                    key={route.path}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleRouteClick(route)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-500/20 border border-indigo-500/40'
                        : 'hover:bg-slate-700/50'
                    }`}
                  >
                    <div 
                      className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ 
                        backgroundColor: appData ? `${appData.color}20` : 'rgba(100, 116, 139, 0.2)',
                        color: appData ? appData.color : '#64748b'
                      }}
                    >
                      {route.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          isSelected ? 'text-indigo-300' : 'text-slate-300'
                        }`}>
                          {route.name}
                        </span>
                        {appData && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded"
                            style={{ 
                              backgroundColor: `${appData.color}20`,
                              color: appData.color 
                            }}
                          >
                            {appData.name}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        {route.path}
                      </span>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-indigo-400"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-slate-900/50 rounded-xl p-4 h-full">
            <div className="flex items-center gap-2 mb-4">
              <ArrowRight className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-400">路由匹配流程</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={selectedRoute !== '/' ? { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.5)' } : {}}
                  className="w-10 h-10 rounded-xl bg-slate-700/50 border border-slate-600 flex items-center justify-center flex-shrink-0"
                >
                  <Globe className="w-5 h-5 text-slate-400" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm text-slate-300">用户访问 URL</p>
                  <p className="text-xs text-slate-500 font-mono">{selectedRoute}</p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </div>

              <div className="flex items-center gap-3">
                <motion.div
                  animate={selectedRoute !== '/' ? { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.5)' } : {}}
                  className="w-10 h-10 rounded-xl bg-slate-700/50 border border-slate-600 flex items-center justify-center flex-shrink-0"
                >
                  <Navigation className="w-5 h-5 text-slate-400" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm text-slate-300">主应用路由匹配</p>
                  <p className="text-xs text-slate-500">查询路由映射表</p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </div>

              <div className="flex items-center gap-3">
                <AnimatePresence mode="wait">
                  {activeAppData ? (
                    <motion.div
                      key={activeAppData.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ 
                        backgroundColor: `${activeAppData.color}20`,
                        border: `2px solid ${activeAppData.color}50`
                      }}
                    >
                      <Box className="w-5 h-5" style={{ color: activeAppData.color }} />
                    </motion.div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-700/50 border border-slate-600 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                </AnimatePresence>
                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    {activeAppData ? (
                      <motion.div
                        key={activeAppData.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <p className="text-sm font-medium" style={{ color: activeAppData.color }}>
                          激活 {activeAppData.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          路由前缀: {activeAppData.route}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <p className="text-sm text-slate-300">主应用首页</p>
                        <p className="text-xs text-slate-500">无匹配子应用</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </div>

              <div className="flex items-center gap-3">
                <motion.div
                  animate={selectedRoute !== '/' ? { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.5)' } : {}}
                  className="w-10 h-10 rounded-xl bg-slate-700/50 border border-slate-600 flex items-center justify-center flex-shrink-0"
                >
                  <Globe className="w-5 h-5 text-slate-400" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm text-slate-300">子应用内部路由</p>
                  <p className="text-xs text-slate-500">子应用独立管理剩余路径</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Box({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      style={style}
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/>
      <path d="M12 22V12"/>
    </svg>
  );
}
