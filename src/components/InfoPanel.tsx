import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { 
  Info, 
  X, 
  ChevronRight, 
  ChevronDown,
  Droplets,
  Gauge,
  Triangle,
  BookOpen
} from 'lucide-react';
import { DAM_DEFAULT_PARAMS } from '@/stores/appStore';

const INFO_SECTIONS = [
  {
    id: 'basic',
    icon: Info,
    title: '三峡大坝基本参数',
    content: [
      { label: '坝高', value: '181米' },
      { label: '坝顶长度', value: '2335米' },
      { label: '坝顶高程', value: '185米' },
      { label: '正常蓄水位', value: '175米' },
      { label: '防洪限制水位', value: '145米' },
      { label: '总库容', value: '393亿立方米' },
      { label: '防洪库容', value: '221.5亿立方米' },
      { label: '装机容量', value: '2250万千瓦' },
    ]
  },
  {
    id: 'holes',
    icon: Gauge,
    title: '泄洪孔分布',
    content: [
      { label: '泄洪深孔', value: '23个，直径7米' },
      { label: '泄洪表孔', value: '22个，宽8米' },
      { label: '排漂孔', value: '7个' },
      { label: '排沙孔', value: '25个' },
      { label: '总计', value: '77个泄洪设施' },
    ]
  },
  {
    id: 'principle',
    icon: Droplets,
    title: '泄洪原理',
    content: [],
    description: '三峡大坝泄洪系统采用多层泄洪设施，包括深孔、表孔、排沙孔等多种类型。深孔主要用于泄洪和排沙，表孔主要用于大流量泄洪。当水位超过防洪限制水位时，根据调度规则逐步开启泄洪设施，以确保大坝安全和下游防洪安全。'
  },
  {
    id: 'dispatch',
    icon: Triangle,
    title: '泄洪调度规则',
    content: [],
    description: '三峡大坝泄洪调度遵循以下原则：\n\n1. **水位145米以下：正常发电，不泄洪\n2. **水位145-155米：根据预报可能开启泄洪\n3. **水位155-165米：根据需要开启泄洪设施\n4. **水位165-175米：大流量泄洪\n5. **水位超过175米：超标准洪水应对\n\n调度目标：确保大坝安全、保障下游防洪安全、兼顾发电效益。'
  },
  {
    id: 'safety',
    icon: BookOpen,
    title: '安全标准',
    content: [
      { label: '设计洪水标准', value: '千年一遇' },
      { label: '校核洪水标准', value: '万年一遇+10%' },
      { label: '设计泄洪流量', value: '71200 m³/s' },
      { label: '最大泄洪能力', value: '124300 m³/s' },
    ]
  },
];

export function InfoPanel() {
  const { ui, toggleInfoPanel } = useAppStore();
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);
  
  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };
  
  if (!ui.infoPanelOpen) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="glass-panel w-full max-w-2xl max-h-[80vh] flex flex-col m-4">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-water-light" />
            <h2 className="text-lg font-semibold">三峡大坝科普信息</h2>
          </div>
          <button 
            onClick={toggleInfoPanel}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {INFO_SECTIONS.map((section) => {
            const isExpanded = expandedSections.includes(section.id);
            const Icon = section.icon;
            
            return (
              <div key={section.id} className="bg-white/5 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-water-light" />
                    <span className="font-medium text-sm">{section.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-white/50" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white/50" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-white/5">
                    {section.description && (
                      <div className="text-sm text-white/70 leading-relaxed whitespace-pre-line pt-3">
                        {section.description}
                      </div>
                    )}
                    
                    {section.content.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {section.content.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-2 bg-white/5 rounded"
                          >
                            <span className="text-xs text-white/60">{item.label}</span>
                            <span className="text-sm font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          <div className="bg-water-blue/10 border border-water-blue/30 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-water-light text-sm mb-2">关于本程序</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              本程序为三峡大坝泄洪动态展示系统，旨在通过3D可视化技术直观展示三峡大坝泄洪过程。
              程序包含实时数据展示、历史记录回溯、模拟演练等功能，帮助公众了解水利工程知识，
              监测大坝运行状态。
            </p>
            <p className="text-xs text-white/50 mt-2">
              数据更新频率：约10秒（演示模式）
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t border-white/10 text-center">
          <button
            onClick={toggleInfoPanel}
            className="control-btn-primary justify-center"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
