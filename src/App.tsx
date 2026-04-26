import { motion } from 'framer-motion';
import { Boxes, Play, Code2, Navigation2, MessageSquare, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { AnimationProvider } from './contexts/AnimationContext';
import { ControlPanel } from './components/ControlPanel';
import { StepIndicator } from './components/StepIndicator';
import { ArchitectureOverview } from './components/ArchitectureOverview';
import { LoadingFlowAnimation } from './components/LoadingFlowAnimation';
import { RouteSwitchDemo } from './components/RouteSwitchDemo';
import { CommunicationVisualization } from './components/CommunicationVisualization';

type TabId = 'overview' | 'loading' | 'routing' | 'communication' | 'control';

const tabs = [
  { id: 'overview' as TabId, label: '架构总览', icon: <Boxes className="w-4 h-4" /> },
  { id: 'loading' as TabId, label: '加载流程', icon: <Play className="w-4 h-4" /> },
  { id: 'routing' as TabId, label: '路由切换', icon: <Navigation2 className="w-4 h-4" /> },
  { id: 'communication' as TabId, label: '应用通信', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'control' as TabId, label: '控制面板', icon: <Settings2 className="w-4 h-4" /> },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('loading');

  return (
    <AnimationProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <MainContent activeTab={activeTab} />
      </div>
    </AnimationProvider>
  );
}

function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"
            >
              <Code2 className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-white">
                微前端原理演示系统
              </h1>
              <p className="text-xs text-slate-400">
                Micro-Frontend Principle Visualization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-400">演示就绪</span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function TabNavigation({ activeTab, onTabChange }: { activeTab: TabId; onTabChange: (tab: TabId) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="border-b border-slate-700/50 bg-slate-900/30"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto py-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function MainContent({ activeTab }: { activeTab: TabId }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'loading' && <LoadingTab />}
        {activeTab === 'routing' && <RoutingTab />}
        {activeTab === 'communication' && <CommunicationTab />}
        {activeTab === 'control' && <ControlTab />}
      </motion.div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ArchitectureOverview />
        <div className="space-y-6">
          <ControlPanel />
          <StepIndicator />
        </div>
      </div>
    </div>
  );
}

function LoadingTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LoadingFlowAnimation />
        </div>
        <div className="space-y-6">
          <ControlPanel />
          <StepIndicator />
        </div>
      </div>
    </div>
  );
}

function RoutingTab() {
  return (
    <div className="space-y-6">
      <RouteSwitchDemo />
    </div>
  );
}

function CommunicationTab() {
  return (
    <div className="space-y-6">
      <CommunicationVisualization />
    </div>
  );
}

function ControlTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ControlPanel />
        <StepIndicator />
      </div>
      
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
        <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
          功能说明
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: '架构总览',
              desc: '对比单体架构与微前端架构的核心区别，展示各自的优势和劣势',
              icon: <Boxes className="w-5 h-5 text-indigo-400" />
            },
            {
              title: '加载流程',
              desc: '动态演示子应用从注册、加载、挂载到运行的完整生命周期',
              icon: <Play className="w-5 h-5 text-emerald-400" />
            },
            {
              title: '路由切换',
              desc: '可视化展示主应用如何匹配路由并激活对应子应用',
              icon: <Navigation2 className="w-5 h-5 text-purple-400" />
            },
            {
              title: '应用通信',
              desc: '演示基于事件总线的跨应用通信机制，支持主应用与子应用间数据传递',
              icon: <MessageSquare className="w-5 h-5 text-pink-400" />
            },
            {
              title: '控制面板',
              desc: '支持播放/暂停、单步演示、播放调速，可精确控制动画演示流程',
              icon: <Settings2 className="w-5 h-5 text-amber-400" />
            },
            {
              title: '技术特性',
              desc: '子应用独立构建、独立部署、按需加载、相互隔离，技术栈无关',
              icon: <Code2 className="w-5 h-5 text-cyan-400" />
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50"
            >
              <div className="flex items-center gap-3 mb-2">
                {item.icon}
                <h4 className="text-sm font-bold text-slate-200">{item.title}</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
