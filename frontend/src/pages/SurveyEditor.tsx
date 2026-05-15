import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical, Save, ArrowLeft, X } from 'lucide-react';
import { surveyApi } from '../api';
import { QuestionType } from '../types';
import type { Question, Survey } from '../types';

const questionTypeLabels: Record<QuestionType, string> = {
  [QuestionType.SINGLE_CHOICE]: '单选题',
  [QuestionType.MULTIPLE_CHOICE]: '多选题',
  [QuestionType.TEXT]: '文本题',
  [QuestionType.RATING]: '评分题',
  [QuestionType.SCALE]: '量表题',
};

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function SurveyEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = id && id !== 'new';

  useEffect(() => {
    if (isEdit) {
      loadSurvey();
    }
  }, [id]);

  const loadSurvey = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const survey = await surveyApi.get(id);
      setTitle(survey.title);
      setDescription(survey.description);
      setQuestions(survey.questions);
    } catch (error) {
      console.error('Failed to load survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: generateId(),
      type,
      title: '',
      required: false,
      options: type === QuestionType.SINGLE_CHOICE || type === QuestionType.MULTIPLE_CHOICE ? ['选项1', '选项2'] : undefined,
      minRating: type === QuestionType.RATING || type === QuestionType.SCALE ? 1 : undefined,
      maxRating: type === QuestionType.RATING || type === QuestionType.SCALE ? 5 : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId && q.options
          ? { ...q, options: [...q.options, `选项${q.options.length + 1}`] }
          : q
      )
    );
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId && q.options
          ? { ...q, options: q.options.map((opt, i) => (i === optionIndex ? value : opt)) }
          : q
      )
    );
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId && q.options
          ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) }
          : q
      )
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('请输入问卷标题');
      return;
    }
    if (questions.length === 0) {
      alert('请至少添加一个问题');
      return;
    }
    for (const q of questions) {
      if (!q.title.trim()) {
        alert('请填写所有问题的标题');
        return;
      }
    }

    setSaving(true);
    try {
      const data = { title, description, questions };
      if (isEdit && id) {
        await surveyApi.update(id, data);
      } else {
        const newSurvey = await surveyApi.create(data as Survey);
        navigate(`/surveys/${newSurvey.id}/edit`);
      }
      alert('保存成功！');
    } catch (error) {
      console.error('Failed to save survey:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? '编辑问卷' : '创建问卷'}
            </h1>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? '保存中...' : '保存问卷'}</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              问卷标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入问卷标题"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-medium"
            />
            <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
              问卷描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入问卷描述（选填）"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </motion.div>

          <AnimatePresence>
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                      {questionTypeLabels[question.type]}
                    </span>
                  </div>
                  <button
                    onClick={() => removeQuestion(question.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center mb-4">
                  <input
                    type="text"
                    value={question.title}
                    onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                    placeholder="请输入问题标题"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mr-4"
                  />
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">必填</span>
                  </label>
                </div>

                {(question.type === QuestionType.SINGLE_CHOICE || question.type === QuestionType.MULTIPLE_CHOICE) && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <motion.div
                        key={optionIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center space-x-2"
                      >
                        <div
                          className={`w-4 h-4 border-2 rounded ${
                            question.type === QuestionType.SINGLE_CHOICE
                              ? 'rounded-full'
                              : 'rounded'
                          } border-gray-300`}
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                        {question.options.length > 2 && (
                          <button
                            onClick={() => removeOption(question.id, optionIndex)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addOption(question.id)}
                      className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 px-3 py-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>添加选项</span>
                    </motion.button>
                  </div>
                )}

                {(question.type === QuestionType.RATING || question.type === QuestionType.SCALE) && (
                  <div className="flex items-center space-x-4">
                    <label className="text-sm text-gray-600">
                      最小值:
                      <input
                        type="number"
                        value={question.minRating}
                        onChange={(e) => updateQuestion(question.id, { minRating: parseInt(e.target.value) })}
                        className="ml-2 w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm"
                      />
                    </label>
                    <label className="text-sm text-gray-600">
                      最大值:
                      <input
                        type="number"
                        value={question.maxRating}
                        onChange={(e) => updateQuestion(question.id, { maxRating: parseInt(e.target.value) })}
                        className="ml-2 w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm"
                      />
                    </label>
                  </div>
                )}

                {question.type === QuestionType.TEXT && (
                  <div className="px-3 py-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">用户将可以输入任意文本回答</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {questions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-sm p-12 text-center border-2 border-dashed border-gray-200"
            >
              <p className="text-gray-500 mb-4">还没有添加任何问题</p>
              <p className="text-sm text-gray-400">点击右侧按钮添加问题</p>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 sticky top-8"
          >
            <h2 className="font-semibold text-gray-900 mb-4">添加问题</h2>
            <div className="space-y-2">
              {Object.entries(questionTypeLabels).map(([type, label]) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addQuestion(type as QuestionType)}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left bg-gray-50 hover:bg-primary-50 rounded-lg transition-colors group"
                >
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 group-hover:text-primary-600">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-gray-700 group-hover:text-primary-700">{label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
