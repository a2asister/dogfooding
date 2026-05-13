import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import SortableSection from '../components/SortableSection';
import SectionEditor from '../components/SectionEditor';
import { GET_RESUME, GET_RESUMES } from '../graphql/queries';
import { CREATE_RESUME, UPDATE_RESUME } from '../graphql/mutations';
import { useUser } from '../contexts/UserContext';

export interface ResumeSection {
  id: string;
  type: string;
  title: string;
  data: Record<string, any>;
}

const defaultSections: ResumeSection[] = [
  {
    id: 'personal',
    type: 'personal',
    title: '个人信息',
    data: {
      name: '张三',
      title: '高级前端工程师',
      email: 'zhangsan@example.com',
      phone: '138-0000-0000',
      location: '北京市',
    },
  },
  {
    id: 'summary',
    type: 'summary',
    title: '个人简介',
    data: {
      content: '5年前端开发经验，精通React生态，擅长高性能Web应用开发。',
    },
  },
  {
    id: 'experience',
    type: 'experience',
    title: '工作经历',
    data: {
      items: [
        {
          company: '科技有限公司',
          position: '前端工程师',
          period: '2021 - 至今',
          description: '负责核心业务系统前端架构设计与开发',
        },
      ],
    },
  },
  {
    id: 'education',
    type: 'education',
    title: '教育背景',
    data: {
      items: [
        {
          school: '北京大学',
          major: '计算机科学与技术',
          degree: '本科',
          period: '2015 - 2019',
        },
      ],
    },
  },
  {
    id: 'skills',
    type: 'skills',
    title: '技能特长',
    data: {
      skills: ['React', 'TypeScript', 'Node.js', 'CSS3', 'Webpack'],
    },
  },
];

const sectionTypes = [
  { type: 'personal', label: '个人信息', icon: '👤' },
  { type: 'summary', label: '个人简介', icon: '📝' },
  { type: 'experience', label: '工作经历', icon: '💼' },
  { type: 'education', label: '教育背景', icon: '🎓' },
  { type: 'skills', label: '技能特长', icon: '⚡' },
  { type: 'projects', label: '项目经验', icon: '🚀' },
];

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [sections, setSections] = useState<ResumeSection[]>(defaultSections);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [title, setTitle] = useState('我的简历');
  const [isAnimating, setIsAnimating] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 加载简历数据
  const { data, loading } = useQuery(GET_RESUME, {
    variables: { id: id || '' },
    skip: !id || id === 'new',
  });

  const [createResume] = useMutation(CREATE_RESUME, {
    refetchQueries: [{ query: GET_RESUMES, variables: { userId: user?.id } }],
  });
  const [updateResume] = useMutation(UPDATE_RESUME, {
    refetchQueries: [{ query: GET_RESUMES, variables: { userId: user?.id } }],
  });

  useEffect(() => {
    if (data?.resume) {
      setTitle(data.resume.title || '我的简历');
      try {
        const parsedSections = JSON.parse(data.resume.content);
        if (Array.isArray(parsedSections)) {
          setSections(parsedSections);
        }
      } catch (e) {
        console.error('解析简历内容失败:', e);
      }
    }
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function addSection(type: string) {
    const sectionInfo = sectionTypes.find((s) => s.type === type);
    if (!sectionInfo) return;

    // 检查是否已存在该类型的模块（除了experience和education允许多个）
    const singleInstanceTypes = ['personal', 'summary', 'skills'];
    if (singleInstanceTypes.includes(type)) {
      const exists = sections.some((s) => s.type === type);
      if (exists) {
        alert(`"${sectionInfo.label}" 模块已存在，请勿重复添加`);
        return;
      }
    }

    const newSection: ResumeSection = {
      id: `${type}-${Date.now()}`,
      type,
      title: sectionInfo.label,
      data: {},
    };
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
  }

  function updateSection(id: string, data: Record<string, any>) {
    setSections(sections.map((s) => (s.id === id ? { ...s, data } : s)));
  }

  function deleteSection(id: string) {
    setSections(sections.filter((s) => s.id !== id));
    if (activeSection === id) setActiveSection(null);
  }

  const handleSave = async () => {
    if (!user) {
      alert('用户信息未加载完成，请稍后重试');
      return;
    }

    setSaving(true);
    try {
      const content = JSON.stringify(sections);
      const layout = JSON.stringify({ order: sections.map((s) => s.id) });

      if (id && id !== 'new') {
        // 更新现有简历
        await updateResume({
          variables: {
            id,
            input: { title, content, layout },
          },
        });
      } else {
        // 创建新简历
        const { data } = await createResume({
          variables: {
            input: {
              title,
              content,
              layout,
              userId: user.id,
            },
          },
        });
        if (data?.createResume?.id) {
          navigate(`/editor/${data.createResume.id}`, { replace: true });
        }
      }
      alert('✅ 简历保存成功！');
    } catch (error) {
      console.error('保存失败:', error);
      alert('❌ 保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    navigate(`/preview/${id || 'demo'}`);
  };

  if (loading && id && id !== 'new') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-sm px-6 py-4 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← 返回
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold text-gray-800 border-none outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              👁️ 预览
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '💾 保存中...' : '💾 保存'}
            </button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto p-6 flex gap-6">
        <motion.aside
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-64 flex-shrink-0"
        >
          <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4">添加模块</h3>
            <div className="grid grid-cols-2 gap-2">
              {sectionTypes.map((type, index) => (
                <motion.button
                  key={type.type}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addSection(type.type)}
                  className="p-3 bg-gray-50 hover:bg-indigo-50 rounded-xl text-center transition-colors group"
                >
                  <span className="text-2xl block mb-1">{type.icon}</span>
                  <span className="text-xs text-gray-600 group-hover:text-indigo-600">
                    {type.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.aside>

        <main className="flex-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence>
                {sections.map((section, index) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    index={isAnimating ? index : -1}
                    isActive={activeSection === section.id}
                    onSelect={() => setActiveSection(section.id)}
                    onDelete={() => deleteSection(section.id)}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>

          {sections.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm p-12 text-center"
            >
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">开始创建你的简历</h3>
              <p className="text-gray-500">从左侧选择模块，开始构建你的专业简历</p>
            </motion.div>
          )}
        </main>

        <aside className="w-80 flex-shrink-0">
          <SectionEditor
            section={sections.find((s) => s.id === activeSection)}
            onUpdate={(data) => activeSection && updateSection(activeSection, data)}
          />
        </aside>
      </div>
    </div>
  );
}
