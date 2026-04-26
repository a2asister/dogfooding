import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Radio, 
  ArrowRightLeft,
  Zap,
  Code2,
  Layers
} from 'lucide-react';
import { useAnimation } from '../contexts/AnimationContext';
import { SUB_APPS } from '../types';
import { useState, useEffect } from 'react';

interface Message {
  id: string;
  from: 'main' | 'app1' | 'app2' | 'app3';
  to: 'main' | 'app1' | 'app2' | 'app3';
  message: string;
  timestamp: number;
}

const appIds = ['main', 'app1', 'app2', 'app3'] as const;

const appConfig: Record<(typeof appIds)[number], {
  name: string;
  color: string;
  icon: React.ReactNode;
}> = {
  main: { 
    name: '主应用', 
    color: '#6366f1', 
    icon: <Layers className="w-5 h-5" /> 
  },
  app1: { 
    name: '商品中心', 
    color: '#6366f1', 
    icon: <Box className="w-5 h-5" /> 
  },
  app2: { 
    name: '订单系统', 
    color: '#10b981', 
    icon: <Box className="w-5 h-5" /> 
  },
  app3: { 
    name: '用户中心', 
    color: '#f59e0b', 
    icon: <Box className="w-5 h-5" /> 
  },
};

const predefinedMessages = [
  { from: 'main' as const, to: 'app1' as const, message: '用户登录状态变更: { isLoggedIn: true }' },
  { from: 'app1' as const, to: 'main' as const, message: '请求全局配置信息' },
  { from: 'main' as const, to: 'app1' as const, message: '{ theme: "dark", language: "zh-CN" }' },
  { from: 'app1' as const, to: 'app2' as const, message: '商品已加入购物车，数量: 2' },
  { from: 'app2' as const, to: 'main' as const, message: '订单创建成功，订单号: ORD123456' },
  { from: 'main' as const, to: 'app3' as const, message: '更新用户积分: +100' },
];

export function CommunicationVisualization() {
  const { state, setCommunication } = useAnimation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFrom, setSelectedFrom] = useState<(typeof appIds)[number]>('main');
  const [selectedTo, setSelectedTo] = useState<(typeof appIds)[number]>('app1');
  const [customMessage, setCustomMessage] = useState('');
  const [autoSend, setAutoSend] = useState(false);

  useEffect(() => {
    if (autoSend) {
      const interval = setInterval(() => {
        const randomMsg = predefinedMessages[Math.floor(Math.random() * predefinedMessages.length)];
        sendMessage(randomMsg.from, randomMsg.to, randomMsg.message);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [autoSend]);

  const sendMessage = (from: typeof appIds[number], to: typeof appIds[number], message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      from,
      to,
      message,
      timestamp: Date.now(),
    };
    setMessages(prev => [newMessage, ...prev].slice(0, 10));
    setCommunication({ from, to, message });
    
    setTimeout(() => setCommunication(null), 2000);
  };

  const handleSend = () => {
    if (customMessage.trim() && selectedFrom !== selectedTo) {
      sendMessage(selectedFrom, selectedTo, customMessage);
      setCustomMessage('');
    }
  };

  const handleSendPredefined = (msg: typeof predefinedMessages[0]) => {
    sendMessage(msg.from, msg.to, msg.message);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
    >
      <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
        <MessageCircle className="w-4 h-4" />
        应用通信可视化
      </h3>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="bg-slate-900/50 rounded-xl p-6 mb-4">
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-64 h-64">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/20"
                />
                
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  animate={
                    state.communicationData?.from === 'main' || state.communicationData?.to === 'main'
                      ? { scale: [1, 1.1, 1] }
                      : {}
                  }
                >
                  <AppNode appId="main" isActive={state.communicationData?.from === 'main' || state.communicationData?.to === 'main'} />
                </motion.div>

                {['app1', 'app2', 'app3'].map((appId, index) => {
                  const angle = (index * 120 - 90) * (Math.PI / 180);
                  const radius = 100;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const isActive = state.communicationData?.from === appId || state.communicationData?.to === appId;

                  return (
                    <motion.div
                      key={appId}
                      className="absolute top-1/2 left-1/2"
                      style={{
                        x: x - 32,
                        y: y - 32,
                      }}
                      animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                    >
                      <AppNode appId={appId as 'app1' | 'app2' | 'app3'} isActive={isActive} />
                    </motion.div>
                  );
                })}

                <AnimatePresence>
                  {state.communicationData && (
                    <CommunicationLine 
                      from={state.communicationData.from}
                      to={state.communicationData.to}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {appIds.map(appId => (
                <div key={appId} className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: appConfig[appId].color }}
                  />
                  <span className="text-xs text-slate-300">{appConfig[appId].name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-slate-400">消息历史</span>
              </div>
              <button
                onClick={() => setAutoSend(!autoSend)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                  autoSend 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                <Zap className="w-3 h-3" />
                {autoSend ? '自动发送中' : '自动发送'}
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              <AnimatePresence>
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-4"
                  >
                    <MessageCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">暂无消息，点击下方预设消息开始演示</p>
                  </motion.div>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-start gap-2 px-3 py-2 bg-slate-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span 
                          className="text-xs font-medium px-1.5 py-0.5 rounded"
                          style={{ 
                            backgroundColor: `${appConfig[msg.from].color}20`,
                            color: appConfig[msg.from].color 
                          }}
                        >
                          {appConfig[msg.from].name}
                        </span>
                        <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                        <span 
                          className="text-xs font-medium px-1.5 py-0.5 rounded"
                          style={{ 
                            backgroundColor: `${appConfig[msg.to].color}20`,
                            color: appConfig[msg.to].color 
                          }}
                        >
                          {appConfig[msg.to].name}
                        </span>
                      </div>
                      <code className="text-xs text-slate-400 font-mono truncate flex-1">
                        {msg.message}
                      </code>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">发送消息</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">发送方</label>
                  <select
                    value={selectedFrom}
                    onChange={(e) => setSelectedFrom(e.target.value as typeof appIds[number])}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    {appIds.map(id => (
                      <option key={id} value={id}>{appConfig[id].name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">接收方</label>
                  <select
                    value={selectedTo}
                    onChange={(e) => setSelectedTo(e.target.value as typeof appIds[number])}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    {appIds.filter(id => id !== selectedFrom).map(id => (
                      <option key={id} value={id}>{appConfig[id].name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">消息内容</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder='{ key: "value" }'
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={!customMessage.trim() || selectedFrom === selectedTo}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400">预设消息（点击发送）</span>
            </div>

            <div className="space-y-2">
              {predefinedMessages.map((msg, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.01, x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSendPredefined(msg)}
                  className="w-full text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="text-xs font-medium px-1.5 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${appConfig[msg.from].color}20`,
                        color: appConfig[msg.from].color 
                      }}
                    >
                      {appConfig[msg.from].name}
                    </span>
                    <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                    <span 
                      className="text-xs font-medium px-1.5 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${appConfig[msg.to].color}20`,
                        color: appConfig[msg.to].color 
                      }}
                    >
                      {appConfig[msg.to].name}
                    </span>
                  </div>
                  <code className="text-xs text-slate-400 font-mono block truncate">
                    {msg.message}
                  </code>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AppNode({ appId, isActive }: { appId: typeof appIds[number]; isActive: boolean }) {
  const config = appConfig[appId];

  return (
    <motion.div
      className={`relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${
        isActive ? 'ring-2 ring-offset-2 ring-offset-slate-900' : ''
      }`}
      style={{
        backgroundColor: `${config.color}20`,
        border: `2px solid ${config.color}50`,
        ringColor: config.color,
      }}
      animate={isActive ? {
        boxShadow: [
          `0 0 0 0 ${config.color}50`,
          `0 0 0 10px ${config.color}00`,
          `0 0 0 0 ${config.color}00`
        ]
      } : {}}
      transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
    >
      <div style={{ color: config.color }}>
        {config.icon}
      </div>
      <span 
        className="text-xs mt-1 font-medium"
        style={{ color: config.color }}
      >
        {config.name}
      </span>
    </motion.div>
  );
}

function CommunicationLine({ from, to }: { from: string; to: string }) {
  const getPosition = (appId: string) => {
    if (appId === 'main') return { x: 128, y: 128 };
    const index = ['app1', 'app2', 'app3'].indexOf(appId);
    const angle = (index * 120 - 90) * (Math.PI / 180);
    const radius = 100;
    return {
      x: 128 + Math.cos(angle) * radius,
      y: 128 + Math.sin(angle) * radius,
    };
  };

  const fromPos = getPosition(from);
  const toPos = getPosition(to);

  return (
    <>
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.line
          x1={fromPos.x}
          y1={fromPos.y}
          x2={toPos.x}
          y2={toPos.y}
          stroke="url(#lineGradient)"
          strokeWidth="3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          exit={{ pathLength: 0, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={appConfig[from as keyof typeof appConfig].color} />
            <stop offset="100%" stopColor={appConfig[to as keyof typeof appConfig].color} />
          </linearGradient>
        </defs>
      </svg>
      
      <motion.div
        className="absolute w-3 h-3 bg-white rounded-full shadow-lg"
        initial={{ left: fromPos.x - 6, top: fromPos.y - 6 }}
        animate={{ left: toPos.x - 6, top: toPos.y - 6 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{
          boxShadow: `0 0 10px ${appConfig[from as keyof typeof appConfig].color}`,
        }}
      />
    </>
  );
}

function Box({ className }: { className?: string }) {
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
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/>
      <path d="M12 22V12"/>
    </svg>
  );
}
