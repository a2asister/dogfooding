import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dayjs from 'dayjs';
import { articlesApi, commentsApi } from '../api';
import type { Article, Comment } from '../types';
import { useAuthStore } from '../store';

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [articleRes, commentsRes] = await Promise.all([
          articlesApi.getDetail(Number(id)),
          commentsApi.getList({ target_type: 'article', target_id: Number(id) }),
        ]);
        setArticle(articleRes.data);
        setComments(commentsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch article:', error);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [id]);

  const handleLike = async () => {
    if (!article || !user) return;
    try {
      const res = await articlesApi.like(article.id);
      setArticle({ ...article, likes: res.data.likes, is_liked: res.data.liked ? 1 : 0 });
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const handleFavorite = async () => {
    if (!article || !user) return;
    try {
      const res = await articlesApi.favorite(article.id);
      setArticle({ ...article, favorites: res.data.favorites, is_favorited: res.data.favorited ? 1 : 0 });
    } catch (error) {
      console.error('Failed to favorite:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article || !user || !commentContent.trim()) return;
    
    setSubmitting(true);
    try {
      await commentsApi.create({
        target_type: 'article',
        target_id: article.id,
        content: commentContent,
      });
      setCommentContent('');
      const res = await commentsApi.getList({ target_type: 'article', target_id: article.id });
      setComments(res.data.data);
      setArticle({ ...article, comments: article.comments + 1 });
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!article || !user) return;
    if (!window.confirm('确定要删除这篇文章吗？')) return;
    
    try {
      await articlesApi.delete(article.id);
      navigate('/articles');
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <p className="text-gray-500">文章不存在</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <article className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center space-x-2 mb-4">
            {article.is_pinned === 1 && (
              <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">置顶</span>
            )}
            {article.is_featured === 1 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded">精选</span>
            )}
            {article.tags && article.tags.split(',').filter(Boolean).map((tag) => (
              <span
                key={tag}
                className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-6 pb-6 border-b">
            <div className="flex items-center space-x-4">
              <Link to={`/users/${article.user_id}`} className="flex items-center space-x-2">
                <img
                  src={article.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.username}`}
                  alt={article.username}
                  className="w-8 h-8 rounded-full"
                />
                <span>{article.username}</span>
                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                  Lv.{article.level}
                </span>
              </Link>
              <span>{dayjs(article.created_at).format('YYYY-MM-DD HH:mm')}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>👁 {article.views}</span>
            </div>
          </div>
          
          <div className="markdown-body mb-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>
          
          <div className="flex items-center space-x-4 pt-6 border-t">
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                article.is_liked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>👍</span>
              <span>{article.likes}</span>
            </button>
            <button
              onClick={handleFavorite}
              disabled={!user}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                article.is_favorited
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>⭐</span>
              <span>{article.favorites}</span>
            </button>
            {user && user.id === article.user_id && (
              <button
                onClick={handleDelete}
                className="ml-auto px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              >
                删除
              </button>
            )}
          </div>
        </article>

        <div className="bg-white rounded-xl shadow-sm p-8 mt-6">
          <h3 className="font-bold mb-6">评论 ({article.comments})</h3>
          
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
                  disabled={submitting || !commentContent.trim()}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {submitting ? '发布中...' : '发布评论'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
              <Link to="/login" className="text-primary-600 hover:underline">
                登录
              </Link>
              <span className="text-gray-500"> 后发表评论</span>
            </div>
          )}
          
          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="pb-6 border-b last:border-0">
                  <div className="flex items-start space-x-4">
                    <Link to={`/users/${comment.user_id}`}>
                      <img
                        src={comment.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}`}
                        alt={comment.username}
                        className="w-10 h-10 rounded-full"
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{comment.username}</span>
                        <span className="text-xs text-gray-500">
                          {dayjs(comment.created_at).fromNow()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <button className="hover:text-primary-600">👍 {comment.likes}</button>
                        {comment.reply_count && comment.reply_count > 0 && (
                          <span>💬 {comment.reply_count} 回复</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">暂无评论</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold mb-4">关于作者</h3>
          <Link to={`/users/${article.user_id}`} className="flex items-center space-x-3">
            <img
              src={article.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${article.username}`}
              alt={article.username}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <div className="font-medium">{article.username}</div>
              <div className="text-xs text-gray-500">Lv.{article.level}</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
