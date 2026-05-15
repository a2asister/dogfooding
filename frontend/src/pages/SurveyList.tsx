import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Edit, Trash2, Eye, BarChart3, Globe, Plus } from 'lucide-react';
import { surveyApi } from '../api';
import type { Survey } from '../types';

export default function SurveyList() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const data = await surveyApi.getAll();
      setSurveys(data);
    } catch (error) {
      console.error('Failed to load surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个问卷吗？')) {
      try {
        await surveyApi.delete(id);
        setSurveys(surveys.filter((s) => s.id !== id));
      } catch (error) {
        console.error('Failed to delete survey:', error);
      }
    }
  };

  const handlePublish = async (id: string, isPublished: boolean) => {
    try {
      if (isPublished) {
        await surveyApi.unpublish(id);
      } else {
        await surveyApi.publish(id);
      }
      loadSurveys();
    } catch (error) {
      console.error('Failed to publish survey:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">我的问卷</h1>
          <p className="text-gray-600 mt-1">管理和创建您的在线问卷</p>
        </div>
      </div>

      {surveys.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-12 text-center"
        >
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">还没有问卷</h2>
          <p className="text-gray-500 mb-6">创建您的第一个问卷，开始收集数据吧</p>
          <Link to="/surveys/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              <Plus className="w-5 h-5" />
              <span>创建问卷</span>
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey, index) => (
              <motion.div
                key={survey.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{survey.title}</h3>
                        <p className="text-sm text-gray-500">{survey.questions.length} 个问题</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        survey.isPublished
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {survey.isPublished ? '已发布' : '草稿'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {survey.description || '暂无描述'}
                  </p>

                  <div className="flex items-center space-x-2">
                    <Link to={`/surveys/${survey.id}/edit`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        title="编辑"
                      >
                        <Edit className="w-5 h-5" />
                      </motion.button>
                    </Link>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePublish(survey.id, survey.isPublished)}
                      className={`p-2 rounded-lg ${
                        survey.isPublished
                          ? 'text-orange-600 hover:bg-orange-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={survey.isPublished ? '取消发布' : '发布'}
                    >
                      <Globe className="w-5 h-5" />
                    </motion.button>

                    {survey.isPublished && (
                      <Link to={`/surveys/${survey.id}/take`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                          title="填写问卷"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
                      </Link>
                    )}

                    <Link to={`/surveys/${survey.id}/analytics`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        title="数据统计"
                      >
                        <BarChart3 className="w-5 h-5" />
                      </motion.button>
                    </Link>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(survey.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-auto"
                      title="删除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
