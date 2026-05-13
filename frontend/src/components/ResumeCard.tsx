import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Resume {
  id: string;
  title: string;
  updatedAt: string;
}

interface ResumeCardProps {
  resume: Resume;
}

export default function ResumeCard({ resume }: ResumeCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer group"
    >
      <Link to={`/editor/${resume.id}`}>
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
      </Link>
    </motion.div>
  );
}
