import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dayjs from 'dayjs';
import MDEditor from '@uiw/react-md-editor';
import { questionsApi, commentsApi } from '../api';
import type { Question, Comment } from '../types';
import { useAuthStore } from '../store';

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [questionRes, commentsRes] = await Promise.all([
          questionsApi.getDetail(Number(id)),
          commentsApi.getList({ target_type: 'question', target_id: Number(id) }),
        ]);
        setQuestion(questionRes.data);
        setComments(commentsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch question:', error);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [id]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !user || !answerContent.trim()) return;
    
    setSubmittingAnswer(true);
    try {
      await questionsApi.answer(question.id, { content: answerContent });
      setAnswerContent('');
      const res = await questionsApi.getDetail(question.id);
      setQuestion(res.data);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleAcceptAnswer = async (answerId: number) => {
    if (!question || !user || user.id !== question.user_id) return;
    try {
      await questionsApi.acceptAnswer(answerId);
      const res = await questionsApi.getDetail(question.id);
      setQuestion(res.data);
    } catch (error) {
      console.error('Failed to accept answer:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !user || !commentContent.trim()) return;
    
    setSubmittingComment(true);
    try {
      await commentsApi.create({
        target_type: 'question',
        target_id: question.id,
        content: commentContent,
      });
      setCommentContent('');
      const res = await commentsApi.getList({ target_type: 'question', target_id: question.id });
      setComments(res.data.data);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <p className="text-gray-500">问题不存在</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <article className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center space-x-2 mb-4">
            <span className={`text-xs px-2 py-0.5 rounded ${
              question.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {question.status === 'resolved' ? '已解决' : '进行中'}
            </span>
            {question.tags && question.tags.split(',').filter(Boolean).map((tag) => (
              <span key={tag} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6 pb-6 border-b">
            <Link to={`/users/${question.user_id}`} className="flex items-center space-x-2">
              <img
                src={question.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${question.username}`}
                alt={question.username}
                className="w-8 h-8 rounded-full"
              />
              <span>{question.username}</span>
            </Link>
            <span>{dayjs(question.created_at).format('YYYY-MM-DD HH:mm')}</span>
            <span>👁 {question.views}</span>
          </div>
          
          <div className="markdown-body mb-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {question.content}
            </ReactMarkdown>
          </div>
        </article>

        <div className="bg-white rounded-xl shadow-sm p-8 mt-6">
          <h3 className="font-bold mb-6">回答 ({question.answers?.length || 0})</h3>
          
          {user ? (
            <form onSubmit={handleSubmitAnswer} className="mb-8">
              <MDEditor
                value={answerContent}
                onChange={(val) => setAnswerContent(val || '')}
                height={200}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submittingAnswer || !answerContent.trim()}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {submittingAnswer ? '提交中...' : '提交回答'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
              <Link to="/login" className="text-primary-600 hover:underline">登录</Link>
              <span className="text-gray-500"> 后回答问题</span>
            </div>
          )}
          
          <div className="space-y-6">
            {question.answers && question.answers.length > 0 ? (
              question.answers.map((answer) => (
                <div key={answer.id} className="pb-6 border-b last:border-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Link to={`/users/${answer.user_id}`}>
                        <img
                          src={answer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${answer.username}`}
                          alt={answer.username}
                          className="w-10 h-10 rounded-full"
                        />
                      </Link>
                      <div>
                        <div className="font-medium">{answer.username}</div>
                        <div className="text-xs text-gray-500">
                          {dayjs(answer.created_at).fromNow()}
                        </div>
                      </div>
                    </div>
                    {answer.is_accepted ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        ✓ 已采纳
                      </span>
                    ) : user && user.id === question.user_id && question.status !== 'resolved' ? (
                      <button
                        onClick={() => handleAcceptAnswer(answer.id)}
                        className="text-green-600 hover:text-green-700 text-sm"
                      >
                        采纳答案
                      </button>
                    ) : null}
                  </div>
                  <div className="markdown-body ml-13">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {answer.content}
                    </ReactMarkdown>
                  </div>
                  <div className="flex items-center space-x-4 mt-4 ml-13 text-sm text-gray-500">
                    <button className="hover:text-primary-600">👍 {answer.likes}</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">暂无回答，成为第一个回答者吧！</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 mt-6">
          <h3 className="font-bold mb-6">评论 ({comments.length})</h3>
          
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="写下你的评论..."
                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submittingComment || !commentContent.trim()}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {submittingComment ? '发布中...' : '发布评论'}
                </button>
              </div>
            </form>
          ) : null}
          
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-4">
                <img
                  src={comment.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}`}
                  alt={comment.username}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{comment.username}</span>
                    <span className="text-xs text-gray-500">
                      {dayjs(comment.created_at).fromNow()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold mb-4">关于作者</h3>
          <Link to={`/users/${question.user_id}`} className="flex items-center space-x-3">
            <img
              src={question.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${question.username}`}
              alt={question.username}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <div className="font-medium">{question.username}</div>
              <div className="text-xs text-gray-500">Lv.{question.level}</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
