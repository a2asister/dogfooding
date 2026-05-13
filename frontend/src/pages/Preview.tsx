import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_RESUME } from '../graphql/queries';
import { EXPORT_RESUME } from '../graphql/mutations';

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.9,
  }),
};

export default function Preview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [exporting, setExporting] = useState(false);

  const { data, loading } = useQuery(GET_RESUME, {
    variables: { id: id || '' },
    skip: !id || id === 'demo',
  });

  const [exportResume] = useMutation(EXPORT_RESUME);

  // 从sections中提取简历数据
  const getResumeData = () => {
    if (data?.resume?.content) {
      try {
        const sections = JSON.parse(data.resume.content);
        const result: any = {};
        
        sections.forEach((section: any) => {
          if (section.type === 'personal') {
            Object.assign(result, section.data);
          } else if (section.type === 'summary') {
            result.summary = section.data.content;
          } else if (section.type === 'experience') {
            result.experience = section.data.items || [];
          } else if (section.type === 'education') {
            result.education = section.data.items || [];
          } else if (section.type === 'skills') {
            result.skills = section.data.skills || [];
          }
        });
        
        return {
          name: result.name || '张三',
          title: result.title || '高级前端工程师',
          email: result.email || 'zhangsan@example.com',
          phone: result.phone || '138-0000-0000',
          location: result.location || '北京市',
          summary: result.summary || '5年前端开发经验，精通React生态，擅长高性能Web应用开发。',
          experience: result.experience?.length ? result.experience : [
            {
              company: '科技有限公司',
              position: '前端工程师',
              period: '2021 - 至今',
              description: '负责核心业务系统前端架构设计与开发，主导性能优化项目，首屏加载时间提升50%。',
            },
          ],
          education: result.education?.length ? result.education : [
            {
              school: '北京大学',
              major: '计算机科学与技术',
              degree: '本科',
              period: '2015 - 2019',
            },
          ],
          skills: result.skills?.length ? result.skills : ['React', 'TypeScript', 'Node.js', 'CSS3', 'Webpack'],
        };
      } catch (e) {
        console.error('解析简历数据失败:', e);
      }
    }
    
    // 默认数据
    return {
      name: '张三',
      title: '高级前端工程师',
      email: 'zhangsan@example.com',
      phone: '138-0000-0000',
      location: '北京市',
      summary: '5年前端开发经验，精通React生态，擅长高性能Web应用开发。',
      experience: [
        {
          company: '科技有限公司',
          position: '前端工程师',
          period: '2021 - 至今',
          description: '负责核心业务系统前端架构设计与开发，主导性能优化项目，首屏加载时间提升50%。',
        },
        {
          company: '互联网公司',
          position: '初级前端工程师',
          period: '2019 - 2021',
          description: '参与多个大型项目开发，负责组件库建设。',
        },
      ],
      education: [
        {
          school: '北京大学',
          major: '计算机科学与技术',
          degree: '本科',
          period: '2015 - 2019',
        },
      ],
      skills: ['React', 'TypeScript', 'Node.js', 'CSS3', 'Webpack', 'Vue.js', 'Git', 'Docker'],
    };
  };

  const resumeData = getResumeData();

  const pages = [
    {
      title: '基本信息',
      content: (
        <div className="space-y-8">
          <div className="text-center pb-8 border-b border-gray-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4"
            >
              {resumeData.name?.charAt(0) || '张'}
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{resumeData.name}</h1>
            <p className="text-xl text-indigo-600 font-medium">{resumeData.title}</p>
            <div className="flex justify-center gap-4 mt-4 text-gray-500 text-sm">
              {resumeData.email && <span>📧 {resumeData.email}</span>}
              {resumeData.phone && <span>📱 {resumeData.phone}</span>}
              {resumeData.location && <span>📍 {resumeData.location}</span>}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">
                📝
              </span>
              个人简介
            </h2>
            <p className="text-gray-600 leading-relaxed pl-10">{resumeData.summary}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">
                ⚡
              </span>
              技能特长
            </h2>
            <div className="flex flex-wrap gap-2 pl-10">
              {resumeData.skills.map((skill: string, index: number) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '工作经历',
      content: (
        <div className="space-y-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">
              💼
            </span>
            工作经历
          </h2>
          <div className="space-y-6 pl-10">
            {resumeData.experience.map((exp: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pb-6 border-l-2 border-indigo-200 pl-6"
              >
                <div className="absolute -left-2.5 top-0 w-5 h-5 bg-indigo-500 rounded-full"></div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">{exp.company}</h3>
                    <p className="text-indigo-600 font-medium">{exp.position}</p>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{exp.period}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>
              </motion.div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-6 mt-12 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">
              🎓
            </span>
            教育背景
          </h2>
          <div className="pl-10">
            {resumeData.education.map((edu: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-gray-50 rounded-xl p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800">{edu.school}</h3>
                    <p className="text-indigo-600">{edu.major}</p>
                    <p className="text-gray-500 text-sm">{edu.degree}</p>
                  </div>
                  <span className="text-sm text-gray-500">{edu.period}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const goToPage = (newPage: number) => {
    if (newPage >= 0 && newPage < pages.length) {
      setDirection(newPage > currentPage ? 1 : -1);
      setCurrentPage(newPage);
    }
  };

  const handleExportPDF = async () => {
    if (!id || id === 'demo') {
      alert('请先保存简历后再导出');
      return;
    }

    setExporting(true);
    try {
      const { data } = await exportResume({ variables: { id } });
      if (data?.exportResume) {
        alert('✅ 导出成功！简历数据已准备好\n\n实际项目中这里会生成PDF文件下载');
        console.log('导出数据:', data.exportResume);
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('❌ 导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  if (loading && id && id !== 'demo') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(`/editor/${id || 'new'}`)}
            className="px-4 py-2 bg-white shadow-sm rounded-lg hover:shadow-md transition-shadow font-medium text-gray-700"
          >
            ← 返回编辑
          </button>
          <div className="flex items-center gap-2">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentPage ? 'bg-indigo-500 w-8' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-sm hover:shadow-md transition-shadow font-medium active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? '📥 导出中...' : '📥 导出 PDF'}
          </button>
        </motion.div>

        <div className="relative overflow-hidden" style={{ perspective: 1000 }}>
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentPage}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-3xl shadow-2xl p-12 min-h-[800px]"
            >
              {pages[currentPage].content}
            </motion.div>
          </AnimatePresence>

          <button
            onClick={() => goToPage(currentPage - 1)}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:scale-110 transition-transform ${
              currentPage === 0 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            disabled={currentPage === 0}
          >
            ←
          </button>
          <button
            onClick={() => goToPage(currentPage + 1)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:scale-110 transition-transform ${
              currentPage === pages.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            disabled={currentPage === pages.length - 1}
          >
            →
          </button>
        </div>

        <motion.p className="text-center text-gray-500 text-sm mt-6">
          第 {currentPage + 1} 页，共 {pages.length} 页
        </motion.p>
      </div>
    </div>
  );
}
