import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEditorStore } from '../store/useEditorStore';
import { CanvasElement } from './CanvasElement';

gsap.registerPlugin(ScrollTrigger);

export const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { elements, animationConfig, deviceType, scrollProgress, setScrollProgress } = useEditorStore();

  const refreshTriggers = useCallback(() => {
    ScrollTrigger.refresh();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    ScrollTrigger.getAll().forEach((st) => st.kill());

    const updateAnimations = (progress: number) => {
      animationConfig.triggers.forEach((trigger) => {
        const element = document.querySelector(`[data-element-id="${trigger.elementId}"]`) as HTMLElement;
        if (!element) return;

        const localProgress = Math.max(0, Math.min(1, 
          (progress - trigger.start) / (trigger.end - trigger.start)
        ));

        if (localProgress >= 0 && localProgress <= 1) {
          Object.entries(trigger.to).forEach(([key, value]) => {
            const fromValue = trigger.from[key] ?? (key === 'opacity' ? 1 : 0);
            const toValue = value as number;
            const currentValue = fromValue + (toValue - fromValue) * localProgress;
            
            if (key === 'x' || key === 'y') {
              gsap.set(element, { [key]: currentValue });
            } else if (key === 'scale') {
              gsap.set(element, { scale: currentValue });
            } else if (key === 'rotation') {
              gsap.set(element, { rotation: currentValue });
            } else if (key === 'opacity') {
              gsap.set(element, { opacity: currentValue });
            }
          });
        } else if (progress < trigger.start) {
          gsap.set(element, trigger.from);
        } else {
          gsap.set(element, trigger.to);
        }
      });
    };

    animationConfig.triggers.forEach((trigger) => {
      const element = document.querySelector(`[data-element-id="${trigger.elementId}"]`);
      if (element) {
        gsap.set(element, trigger.from);
      }
    });

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      markers: {
        startColor: 'green',
        endColor: 'red',
        fontSize: '14px',
        indent: 20,
      },
      onUpdate: (self) => {
        setScrollProgress(self.progress);
        updateAnimations(self.progress);
      },
    });

    updateAnimations(scrollProgress);

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [animationConfig.triggers, setScrollProgress]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshTriggers();
    }, 100);
    return () => clearTimeout(timer);
  }, [elements, animationConfig, refreshTriggers]);

  const canvasWidth = deviceType === 'mobile' ? 375 : deviceType === 'tablet' ? 768 : 1440;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 py-8">
      <div
        ref={containerRef}
        className="mx-auto bg-white relative shadow-2xl rounded-lg overflow-hidden"
        style={{ width: canvasWidth, minHeight: '300vh' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            useEditorStore.getState().setSelectedElementId(null);
          }
        }}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          {elements.map((element) => (
            <CanvasElement key={element.id} element={element} />
          ))}
        </div>
      </div>
      
      <div className="fixed bottom-4 left-4 bg-black/90 text-white px-4 py-3 rounded-lg text-sm z-50 max-w-sm shadow-xl">
        <div className="font-bold mb-2 text-yellow-400">🎬 滚动动画控制器</div>
        <div className="mb-2">
          <span className="text-gray-300">滚动进度:</span>
          <span className="ml-2 font-mono text-green-400">{(scrollProgress * 100).toFixed(1)}%</span>
        </div>
        <div className="mb-2">
          <span className="text-gray-300">活动动画数:</span>
          <span className="ml-2 font-mono text-blue-400">{animationConfig.triggers.length}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-75"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
        {animationConfig.triggers.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-xs text-gray-400 mb-1">动画触发区间:</div>
            {animationConfig.triggers.map((t: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs mb-1">
                <span className={`w-2 h-2 rounded-full ${
                  scrollProgress >= t.start && scrollProgress <= t.end ? 'bg-green-400' : 'bg-gray-500'
                }`} />
                <span className="text-gray-300">{t.type}</span>
                <span className="text-gray-500">
                  ({(t.start * 100).toFixed(0)}% - {(t.end * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 text-xs text-yellow-300">
          💡 滚动鼠标或拖动顶部滑块查看动画效果
        </div>
      </div>
    </div>
  );
};
