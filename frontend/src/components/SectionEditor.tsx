import { motion, AnimatePresence } from 'framer-motion';
import { ResumeSection } from '../pages/Editor';

interface SectionEditorProps {
  section: ResumeSection | undefined;
  onUpdate: (data: Record<string, any>) => void;
}

export default function SectionEditor({ section, onUpdate }: SectionEditorProps) {
  if (!section) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-2xl shadow-sm p-8 text-center sticky top-24"
      >
        <div className="text-5xl mb-4">👆</div>
        <h3 className="font-bold text-gray-800 mb-2">选择模块</h3>
        <p className="text-gray-500 text-sm">点击左侧的简历模块进行编辑</p>
      </motion.div>
    );
  }

  const renderFields = () => {
    switch (section.type) {
      case 'personal':
        return (
          <>
            <InputField label="姓名" value={section.data.name || ''} onChange={(v) => onUpdate({ ...section.data, name: v })} />
            <InputField label="职位" value={section.data.title || ''} onChange={(v) => onUpdate({ ...section.data, title: v })} />
            <InputField label="邮箱" value={section.data.email || ''} onChange={(v) => onUpdate({ ...section.data, email: v })} />
            <InputField label="电话" value={section.data.phone || ''} onChange={(v) => onUpdate({ ...section.data, phone: v })} />
            <InputField label="地点" value={section.data.location || ''} onChange={(v) => onUpdate({ ...section.data, location: v })} />
          </>
        );
      case 'summary':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">个人简介</label>
            <textarea
              value={section.data.content || ''}
              onChange={(e) => onUpdate({ ...section.data, content: e.target.value })}
              className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all"
              placeholder="介绍一下你的职业背景和优势..."
            />
          </div>
        );
      case 'experience':
      case 'education':
        return (
          <div className="space-y-4">
            {(section.data.items || []).map((item: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-gray-50 rounded-xl space-y-3"
              >
                <InputField
                  label={section.type === 'experience' ? '公司' : '学校'}
                  value={item.company || item.school || ''}
                  onChange={(v) => {
                    const newItems = [...(section.data.items || [])];
                    newItems[index] = { ...newItems[index], [section.type === 'experience' ? 'company' : 'school']: v };
                    onUpdate({ ...section.data, items: newItems });
                  }}
                />
                <InputField
                  label={section.type === 'experience' ? '职位' : '专业'}
                  value={item.position || item.major || ''}
                  onChange={(v) => {
                    const newItems = [...(section.data.items || [])];
                    newItems[index] = { ...newItems[index], [section.type === 'experience' ? 'position' : 'major']: v };
                    onUpdate({ ...section.data, items: newItems });
                  }}
                />
                <InputField
                  label="时间"
                  value={item.period || ''}
                  onChange={(v) => {
                    const newItems = [...(section.data.items || [])];
                    newItems[index] = { ...newItems[index], period: v };
                    onUpdate({ ...section.data, items: newItems });
                  }}
                />
              </motion.div>
            ))}
            <button
              onClick={() => {
                const newItems = [...(section.data.items || []), {}];
                onUpdate({ ...section.data, items: newItems });
              }}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition-colors font-medium"
            >
              + 添加{section.type === 'experience' ? '工作' : '教育'}经历
            </button>
          </div>
        );
      case 'skills':
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(section.data.skills || []).map((skill: string, index: number) => (
                <motion.span
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-2 group"
                >
                  {skill}
                  <button
                    onClick={() => {
                      const newSkills = section.data.skills.filter((_: string, i: number) => i !== index);
                      onUpdate({ ...section.data, skills: newSkills });
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="添加技能..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    const newSkills = [...(section.data.skills || []), e.currentTarget.value];
                    onUpdate({ ...section.data, skills: newSkills });
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        );
      default:
        return <p className="text-gray-500 text-center py-8">此模块暂不支持编辑</p>;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={section.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-2xl shadow-sm p-6 sticky top-24"
      >
        <h3 className="font-bold text-gray-800 text-lg mb-6">编辑 {section.title}</h3>
        <div className="space-y-4">{renderFields()}</div>
      </motion.div>
    </AnimatePresence>
  );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        placeholder={`输入${label}`}
      />
    </div>
  );
}
