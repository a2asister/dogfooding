import { motion } from 'framer-motion';

function Header() {
  return (
    <header className="bg-surface-elevated border-b border-border shrink-0">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg"
          >
            <span className="text-white font-bold text-xl">⚡</span>
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-text-primary leading-tight">
              Vite 构建原理可视化演示
            </h1>
            <p className="text-sm text-text-secondary">
              交互式动画演示 Vite 开发与生产构建全流程
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-card rounded-lg">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-xs text-text-secondary">演示模式</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
