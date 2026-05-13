import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_RESUMES } from '../graphql/queries';
import { DELETE_RESUME } from '../graphql/mutations';
import { useUser } from '../contexts/UserContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const { data, loading, refetch } = useQuery(GET_RESUMES, {
    variables: { userId: user?.id || 'demo' },
    skip: !user?.id,
  });

  // 页面激活时自动刷新数据
  useEffect(() => {
    if (user?.id) {
      refetch();
    }
  }, [user?.id, refetch]);

  const [deleteResume] = useMutation(DELETE_RESUME, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('确定要删除这份简历吗？')) {
      await deleteResume({ variables: { id } });
    }
  };

  const resumes = data?.resumes || [];

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">简历管理器</h1>
          <p className="text-white/80">拖拽排版，轻松创建专业简历</p>
          {user && <p className="text-white/60 text-sm mt-1">欢迎, {user.name}</p>}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants}>
            <Link to="/editor/new">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 h-full min-h-[200px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition-all duration-300 border-2 border-dashed border-white/30 hover:border-white/50">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                  <span className="text-3xl text-white">+</span>
                </div>
                <span className="text-white font-medium text-lg">创建新简历</span>
              </div>
            </Link>
          </motion.div>

          {resumes.map((resume: any) => (
            <motion.div key={resume.id} variants={itemVariants} className="relative">
              <Link to={`/editor/${resume.id}`}>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer group hover:shadow-2xl transition-shadow">
                  <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 p-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-2 left-4 w-16 h-2 bg-white rounded-full"></div>
                      <div className="absolute top-8 left-4 w-24 h-1.5 bg-white rounded-full"></div>
                      <div className="absolute top-14 left-4 w-20 h-1.5 bg-white rounded-full"></div>
                      <div className="absolute top-20 left-4 w-28 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-xl">📄</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                      {resume.title}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      最后编辑: {new Date(resume.updatedAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) => handleDelete(e, resume.id)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-600 text-white rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                ×
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
