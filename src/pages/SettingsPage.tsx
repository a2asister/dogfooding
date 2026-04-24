import { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Info,
  Heart,
  ChevronRight,
  X,
  Zap,
  Sparkles,
} from 'lucide-react';

export function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      <div className="mb-6 md:mb-8">
        <div className="bg-gradient-to-r from-primary-blue/8 via-primary-light-blue/12 to-primary-blue/8 rounded-3xl p-6 md:p-8 border border-primary-blue/10">
          <div className="flex items-start gap-4">
            <div className="hidden md:flex w-14 h-14 bg-gradient-to-br from-primary-blue to-primary-light-blue rounded-2xl items-center justify-center flex-shrink-0 shadow-md">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-text-dark mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-orange md:hidden" fill="currentColor" />
                设置
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-text-medium leading-relaxed">
                调整应用的个性化设置，让体验更舒适
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full space-y-5 md:space-y-6">
        <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-border-light">
          <div className="px-5 md:px-6 py-4 md:py-5 border-b border-border-subtle bg-border-subtle/30">
            <h3 className="text-sm md:text-base font-bold text-primary-blue flex items-center gap-2">
              <Sun className="w-4 h-4 md:w-5 md:h-5" />
              显示设置
            </h3>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-border-subtle/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                darkMode ? 'bg-primary-blue/10 text-primary-blue' : 'bg-primary-orange/10 text-primary-orange'
              }`}>
                {darkMode ? (
                  <Moon className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                  <Sun className="w-5 h-5 md:w-6 md:h-6" />
                )}
              </div>
              <div className="text-left">
                <span className="text-text-dark text-sm md:text-base font-medium">深色模式</span>
                <p className="text-xs md:text-sm text-text-medium mt-0.5">切换深色/浅色主题</p>
              </div>
            </div>
            <div
              className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${
                darkMode ? 'bg-primary-blue' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform duration-300 shadow-md ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </button>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-border-light">
          <div className="px-5 md:px-6 py-4 md:py-5 border-b border-border-subtle bg-border-subtle/30">
            <h3 className="text-sm md:text-base font-bold text-primary-orange flex items-center gap-2">
              <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
              声音设置
            </h3>
          </div>
          
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-border-subtle/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                soundEnabled ? 'bg-primary-orange/10 text-primary-orange' : 'bg-gray-100 text-text-light'
              }`}>
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                  <VolumeX className="w-5 h-5 md:w-6 md:h-6" />
                )}
              </div>
              <div className="text-left">
                <span className="text-text-dark text-sm md:text-base font-medium">音效</span>
                <p className="text-xs md:text-sm text-text-medium mt-0.5">启用/禁用交互音效</p>
              </div>
            </div>
            <div
              className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${
                soundEnabled ? 'bg-primary-orange' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform duration-300 shadow-md ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </button>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-border-light">
          <div className="px-5 md:px-6 py-4 md:py-5 border-b border-border-subtle bg-border-subtle/30">
            <h3 className="text-sm md:text-base font-bold text-primary-blue flex items-center gap-2">
              <Info className="w-4 h-4 md:w-5 md:h-5" />
              关于应用
            </h3>
          </div>
          
          <button
            onClick={() => setShowAbout(true)}
            className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-border-subtle/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-blue/10 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 md:w-6 md:h-6 text-primary-blue" />
              </div>
              <div className="text-left">
                <span className="text-text-dark text-sm md:text-base font-medium">关于应用</span>
                <p className="text-xs md:text-sm text-text-medium mt-0.5">了解更多关于这款应用</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-text-light group-hover:text-primary-blue group-hover:translate-x-1 transition-all" />
          </button>

          <div className="flex items-center justify-between p-5 md:p-6 border-t border-border-subtle">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-orange/10 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 md:w-6 md:h-6 text-primary-orange" fill="currentColor" />
              </div>
              <div className="text-left">
                <span className="text-text-dark text-sm md:text-base font-medium">版本</span>
                <p className="text-xs md:text-sm text-text-medium mt-0.5">当前应用版本</p>
              </div>
            </div>
            <span className="text-text-medium text-sm md:text-base font-semibold">1.0.0</span>
          </div>
        </div>

        <div className="mt-8 md:mt-12 text-center pb-6">
          <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-primary-blue/10 to-primary-light-blue/10 rounded-2xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-primary-blue" fill="currentColor" />
          </div>
          <p className="text-sm md:text-base text-text-medium font-medium">
            火力发电小课堂
          </p>
          <p className="text-xs md:text-sm text-text-light mt-1.5">
            让科普变得简单有趣 ✨
          </p>
        </div>
      </div>

      <div className="h-20 md:hidden" />

      {showAbout && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-hidden shadow-2xl animate-scale-in border border-border-light"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-primary-blue to-primary-light-blue p-6 md:p-8 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-8 h-8 md:w-10 md:h-10 text-primary-blue" fill="currentColor" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">火力发电小课堂</h2>
              <p className="text-white/80 text-sm md:text-base mt-1">版本 1.0.0</p>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto max-h-[55vh]">
              <h3 className="font-bold text-text-dark mb-3 text-base md:text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-orange" fill="currentColor" />
                应用介绍
              </h3>
              <p className="text-sm md:text-base text-text-medium leading-relaxed mb-6">
                这是一款面向学生、科普爱好者和行业新手的火力发电原理可视化科普应用。通过卡通风格的界面、互动演示和趣味问答，让复杂的发电原理变得简单易懂、生动有趣。
              </p>
              
              <h3 className="font-bold text-text-dark mb-3 text-base md:text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-blue" fill="currentColor" />
                主要功能
              </h3>
              <ul className="text-sm md:text-base text-text-medium space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary-blue mt-0.5">•</span>
                  <span>发电全流程可视化展示</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-blue mt-0.5">•</span>
                  <span>互动演示发电过程</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-blue mt-0.5">•</span>
                  <span>知识点拆解讲解</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-blue mt-0.5">•</span>
                  <span>趣味问答赢取勋章</span>
                </li>
              </ul>
            </div>

            <div className="p-5 md:p-6 border-t border-border-light bg-border-subtle/50">
              <button
                onClick={() => setShowAbout(false)}
                className="w-full py-4 bg-gradient-to-r from-primary-blue to-primary-light-blue text-white font-bold text-base rounded-2xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary-blue/20"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
