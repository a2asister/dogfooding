import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { ResumeSection } from '../pages/Editor';

interface SortableSectionProps {
  section: ResumeSection;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export default function SortableSection({ section, index, isActive, onSelect, onDelete }: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const sectionIcons: Record<string, string> = {
    personal: '👤',
    summary: '📝',
    experience: '💼',
    education: '🎓',
    skills: '⚡',
    projects: '🚀',
  };

  const renderPreview = () => {
    switch (section.type) {
      case 'personal':
        return (
          <div className="space-y-1">
            <div className="text-xl font-bold text-gray-800">{section.data.name || '姓名'}</div>
            <div className="text-indigo-600 font-medium">{section.data.title || '职位'}</div>
            <div className="text-sm text-gray-500">
              {section.data.email} {section.data.phone && '•'} {section.data.phone}
            </div>
          </div>
        );
      case 'summary':
        return <p className="text-gray-600 text-sm line-clamp-2">{section.data.content || '点击编辑个人简介...'}</p>;
      case 'experience':
      case 'education':
        return section.data.items?.slice(0, 1).map((item: any, i: number) => (
          <div key={i} className="space-y-1">
            <div className="font-medium text-gray-800">{item.company || item.school || '公司/学校'}</div>
            <div className="text-sm text-gray-500">{item.position || item.major || '职位/专业'}</div>
          </div>
        )) || null;
      case 'skills':
        return (
          <div className="flex flex-wrap gap-1">
            {section.data.skills?.slice(0, 5).map((skill: string, i: number) => (
              <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full">
                {skill}
              </span>
            ))}
          </div>
        );
      default:
        return <p className="text-gray-400 text-sm">点击编辑内容</p>;
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={index >= 0 ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index >= 0 ? index * 0.1 : 0 }}
      className={`mb-4 cursor-pointer ${isDragging ? 'pointer-events-none' : ''}`}
      onClick={onSelect}
    >
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        className={`bg-white rounded-2xl shadow-sm p-6 border-2 transition-all ${
          isActive ? 'border-indigo-500 shadow-lg shadow-indigo-100' : 'border-transparent hover:border-gray-200'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-grab active:cursor-grabbing transition-colors"
            >
              <span className="text-xl">{sectionIcons[section.type] || '📄'}</span>
            </div>
            <h3 className="font-bold text-gray-800">{section.title}</h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="pl-14">{renderPreview()}</div>
      </motion.div>
    </motion.div>
  );
}
