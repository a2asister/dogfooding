import { X, FolderOpen, Code, Zap } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useProjectStore } from '../store/useProjectStore';
import type { ProjectType } from '../types';

interface ProjectTemplate {
  type: ProjectType;
  name: string;
  description: string;
  icon: any;
  features: string[];
}

const templates: ProjectTemplate[] = [
  {
    type: 'vanilla',
    name: 'Vanilla JS',
    description: '原生 JavaScript 项目，包含 HTML、CSS、JS 基础文件',
    icon: Code,
    features: ['index.html', 'style.css', 'app.js'],
  },
  {
    type: 'react',
    name: 'React',
    description: 'React 18 项目，包含 JSX 组件和基础样式',
    icon: Code,
    features: ['组件化开发', 'JSX 语法', 'Hooks 支持'],
  },
  {
    type: 'vue',
    name: 'Vue 3',
    description: 'Vue 3 项目，使用 Composition API 和 SFC',
    icon: FolderOpen,
    features: ['组合式 API', '单文件组件', '响应式系统'],
  },
  {
    type: 'vite',
    name: 'Vite',
    description: 'Vite 构建工具项目，极速开发体验',
    icon: Zap,
    features: ['极速 HMR', '开箱即用', '优化构建'],
  },
];

export const ProjectCreator = () => {
  const isCreateProjectOpen = useUIStore((state) => state.isCreateProjectOpen);
  const toggleCreateProject = useUIStore((state) => state.toggleCreateProject);
  const createProject = useProjectStore((state) => state.createProject);

  const handleSelectTemplate = (type: ProjectType) => {
    if (window.confirm('创建新项目将覆盖当前项目，确定继续吗？')) {
      createProject(type);
      toggleCreateProject();
    }
  };

  if (!isCreateProjectOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) toggleCreateProject();
      }}
    >
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">创建新项目</h2>
          <button
            onClick={toggleCreateProject}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-400 mb-4">
            选择一个模板来创建新项目，这将覆盖当前项目的所有文件。
          </p>

          <div className="grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <button
                key={template.type}
                onClick={() => handleSelectTemplate(template.type)}
                className="p-4 text-left bg-gray-700 bg-opacity-50 hover:bg-opacity-100 border border-gray-600 hover:border-blue-500 rounded-lg transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-600 rounded-lg group-hover:bg-blue-600 transition-colors">
                    <template.icon size={24} className="text-gray-300 group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium mb-1">{template.name}</h3>
                    <p className="text-xs text-gray-400 mb-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs bg-gray-600 text-gray-300 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-850">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              提示：您的更改会自动保存到本地存储
            </p>
            <button
              onClick={toggleCreateProject}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
