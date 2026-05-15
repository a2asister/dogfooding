import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { surveyApi, responseApi } from '../api';
import { QuestionType } from '../types';
import type { Survey, Answer } from '../types';

export default function SurveyTake() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      loadSurvey();
    }
  }, [id]);

  const loadSurvey = async () => {
    try {
      const data = await surveyApi.getPublished(id!);
      setSurvey(data);
      const initialAnswers = data.questions.map((q) => ({
        questionId: q.id,
        value: q.type === QuestionType.MULTIPLE_CHOICE ? [] : '',
      }));
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Failed to load survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (questionId: string, value: string | string[] | number) => {
    setAnswers((prev) =>
      prev.map((a) => (a.questionId === questionId ? { ...a, value } : a))
    );
  };

  const handleOptionClick = (questionId: string, option: string, type: QuestionType) => {
    if (type === QuestionType.SINGLE_CHOICE) {
      updateAnswer(questionId, option);
    } else if (type === QuestionType.MULTIPLE_CHOICE) {
      setAnswers((prev) => {
        const currentAnswer = prev.find((a) => a.questionId === questionId);
        const currentValues = Array.isArray(currentAnswer?.value) ? currentAnswer.value : [];
        if (currentValues.includes(option)) {
          return prev.map((a) =>
            a.questionId === questionId
              ? { ...a, value: currentValues.filter((v) => v !== option) }
              : a
          );
        } else {
          return prev.map((a) =>
            a.questionId === questionId
              ? { ...a, value: [...currentValues, option] }
              : a
          );
        }
      });
    }
  };

  const handleSubmit = async () => {
    if (!survey) return;

    for (let i = 0; i < survey.questions.length; i++) {
      const question = survey.questions[i];
      const answer = answers.find((a) => a.questionId === question.id);
      const isEmpty = 
        !answer || 
        answer.value === undefined || 
        answer.value === null || 
        answer.value === '' ||
        (Array.isArray(answer.value) && answer.value.length === 0);
      
      if (question.required && isEmpty) {
        setCurrentQuestion(i);
        alert(`请回答问题：${question.title}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await responseApi.create({ surveyId: id!, answers });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit response:', error);
      alert('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (survey && currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">问卷不存在或未发布</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center py-12"
      >
        <div className="bg-white rounded-xl shadow-sm p-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">提交成功！</h2>
          <p className="text-gray-600 mb-6">感谢您完成问卷调查</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            返回首页
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const question = survey.questions[currentQuestion];
  const currentAnswer = answers.find((a) => a.questionId === question.id);
  const progress = ((currentQuestion + 1) / survey.questions.length) * 100;

  const questionVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
          {survey.description && (
            <p className="text-gray-600 mt-1">{survey.description}</p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2 text-right">
          {currentQuestion + 1} / {survey.questions.length}
        </p>
      </div>

      <motion.div
        key={question.id}
        variants={questionVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm p-8 mb-6"
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-start">
            <span className="text-primary-500 mr-2">Q{currentQuestion + 1}.</span>
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h2>
        </div>

        <div className="space-y-4">
          {(question.type === QuestionType.SINGLE_CHOICE || question.type === QuestionType.MULTIPLE_CHOICE) && question.options && (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <motion.label
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOptionClick(question.id, option, question.type)}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    question.type === QuestionType.SINGLE_CHOICE
                      ? currentAnswer?.value === option
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                      : Array.isArray(currentAnswer?.value) && currentAnswer.value.includes(option)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <input
                    type={question.type === QuestionType.SINGLE_CHOICE ? 'radio' : 'checkbox'}
                    name={`question-${question.id}`}
                    checked={
                      question.type === QuestionType.SINGLE_CHOICE
                        ? currentAnswer?.value === option
                        : Array.isArray(currentAnswer?.value) && currentAnswer.value.includes(option)
                    }
                    onChange={() => handleOptionClick(question.id, option, question.type)}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </motion.label>
              ))}
            </div>
          )}

          {question.type === QuestionType.TEXT && (
            <textarea
              value={(currentAnswer?.value as string) || ''}
              onChange={(e) => updateAnswer(question.id, e.target.value)}
              placeholder="请输入您的回答..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          )}

          {(question.type === QuestionType.RATING || question.type === QuestionType.SCALE) && (
            <div className="flex items-center justify-center space-x-2">
              {Array.from(
                { length: (question.maxRating || 5) - (question.minRating || 1) + 1 },
                (_, i) => (question.minRating || 1) + i
              ).map((rating) => (
                <motion.button
                  key={rating}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateAnswer(question.id, rating)}
                  className={`w-12 h-12 rounded-lg text-lg font-semibold transition-colors ${
                    currentAnswer?.value === rating
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-primary-100'
                  }`}
                >
                  {rating}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <div className="flex justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一题
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextQuestion}
          disabled={submitting}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>提交中...</span>
            </>
          ) : currentQuestion === survey.questions.length - 1 ? (
            <>
              <Send className="w-4 h-4" />
              <span>提交问卷</span>
            </>
          ) : (
            <span>下一题</span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
