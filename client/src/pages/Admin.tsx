import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { adminApi } from '../api';
import type { Article, Question, User } from '../types';

type TabType = 'articles' | 'questions' | 'users' | 'topics' | 'stats';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabType>('articles');
  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
  const [pendingQuestions, setPendingQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [submittingTopic, setSubmittingTopic] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const promises: Promise<any>[] = [];
        
        if (activeTab === 'articles') {
          promises.push(adminApi.getPendingArticles());
        }
        if (activeTab === 'questions') {
          promises.push(adminApi.getPendingQuestions());
        }
        if (activeTab === 'users') {
          promises.push(adminApi.getUsers({ limit: 50 }));
        }
        if (activeTab === 'stats') {
          promises.push(adminApi.getStats());
        }

        const results = await Promise.all(promises);
        
        if (activeTab === 'articles' && results[0]) {
          setPendingArticles(results[0].data.data);
        }
        if (activeTab === 'questions' && results[0]) {
          setPendingQuestions(results[0].data.data);
        }
        if (activeTab === 'users' && results[0]) {
          setUsers(results[0].data.data);
        }
        if (activeTab === 'stats' && results[0]) {
          setStats(results[0].data.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [activeTab]);

  const handleApproveArticle = async (id: number) => {
    setActionLoading(id);
    try {
      await adminApi.approveArticle(id);
      setPendingArticles(pendingArticles.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to approve article:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectArticle = async (id: number) => {
    setActionLoading(id);
    try {
      await adminApi.rejectArticle(id);
      setPendingArticles(pendingArticles.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to reject article:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePinArticle = async (id: number, pinned: boolean) => {
    setActionLoading(id);
    try {
      await adminApi.pinArticle(id, { pinned: !pinned });
      setPendingArticles(pendingArticles.map(a => 
        a.id === id ? { ...a, is_pinned: pinned ? 0 : 1 } : a
      ));
    } catch (error) {
      console.error('Failed to pin article:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFeatureArticle = async (id: number, featured: boolean) => {
    setActionLoading(id);
    try {
      await adminApi.featureArticle(id, { featured: !featured });
      setPendingArticles(pendingArticles.map(a => 
        a.id === id ? { ...a, is_featured: featured ? 0 : 1 } : a
      ));
    } catch (error) {
      console.error('Failed to feature article:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveQuestion = async (id: number) => {
    setActionLoading(id);
    try {
      await adminApi.approveQuestion(id);
      setPendingQuestions(pendingQuestions.filter(q => q.id !== id));
    } catch (error) {
      console.error('Failed to approve question:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectQuestion = async (id: number) => {
    setActionLoading(id);
    try {
      await adminApi.rejectQuestion(id);
      setPendingQuestions(pendingQuestions.filter(q => q.id !== id));
    } catch (error) {
      console.error('Failed to reject question:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = async (id: number, banned: boolean) => {
    setActionLoading(id);
    try {
      await adminApi.banUser(id, { banned: !banned });
      setUsers(users.map(u => 
        u.id === id ? { ...u, status: banned ? 'active' : 'banned' } : u
      ));
    } catch (error) {
      console.error('Failed to ban user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    
    setSubmittingTopic(true);
    try {
      await adminApi.createTopic({
        title: newTopicTitle.trim(),
        description: newTopicDesc.trim(),
      });
      setNewTopicTitle('');
      setNewTopicDesc('');
    } catch (error) {
      console.error('Failed to create topic:', error);
    } finally {
      setSubmittingTopic(false);
    }
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'articles', label: '文章审核' },
    { key: 'questions', label: '问答审核' },
    { key: 'users', label: '用户管理' },
    { key: 'topics', label: '话题管理' },
    { key: 'stats', label: '数据统计' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'articles' && (
            <div>
              <h2 className="text-lg font-bold mb-4">待审核文章 ({pendingArticles.length})</h2>
              {pendingArticles.length > 0 ? (
                <div className="space-y-4">
                  {pendingArticles.map((article) => (
                    <div key={article.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link to={`/articles/${article.id}`} className="font-medium hover:text-primary-600">
                            {article.title}
                          </Link>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>作者: {article.username}</span>
                            <span>{dayjs(article.created_at).format('YYYY-MM-DD HH:mm')}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApproveArticle(article.id)}
                            disabled={actionLoading === article.id}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => handleRejectArticle(article.id)}
                            disabled={actionLoading === article.id}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            拒绝
                          </button>
                          <button
                            onClick={() => handlePinArticle(article.id, article.is_pinned === 1)}
                            disabled={actionLoading === article.id}
                            className={`px-3 py-1 text-sm rounded ${
                              article.is_pinned ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 hover:bg-gray-200'
                            } disabled:opacity-50`}
                          >
                            {article.is_pinned ? '取消置顶' : '置顶'}
                          </button>
                          <button
                            onClick={() => handleFeatureArticle(article.id, article.is_featured === 1)}
                            disabled={actionLoading === article.id}
                            className={`px-3 py-1 text-sm rounded ${
                              article.is_featured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 hover:bg-gray-200'
                            } disabled:opacity-50`}
                          >
                            {article.is_featured ? '取消精选' : '精选'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  暂无待审核文章
                </div>
              )}
            </div>
          )}

          {activeTab === 'questions' && (
            <div>
              <h2 className="text-lg font-bold mb-4">待审核问答 ({pendingQuestions.length})</h2>
              {pendingQuestions.length > 0 ? (
                <div className="space-y-4">
                  {pendingQuestions.map((question) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link to={`/questions/${question.id}`} className="font-medium hover:text-primary-600">
                            {question.title}
                          </Link>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>提问者: {question.username}</span>
                            <span>{dayjs(question.created_at).format('YYYY-MM-DD HH:mm')}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApproveQuestion(question.id)}
                            disabled={actionLoading === question.id}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => handleRejectQuestion(question.id)}
                            disabled={actionLoading === question.id}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            拒绝
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  暂无待审核问答
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-lg font-bold mb-4">用户管理 ({users.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">用户</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">等级</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">积分</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">角色</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">注册时间</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link to={`/users/${user.id}`} className="flex items-center space-x-2">
                            <img
                              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                              alt={user.username}
                              className="w-8 h-8 rounded-full"
                            />
                            <span>{user.username}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm">Lv.{user.level}</td>
                        <td className="px-4 py-3 text-sm">{user.points}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role === 'admin' ? '管理员' : '用户'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            user.status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {user.status === 'banned' ? '已封禁' : '正常'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {dayjs(user.created_at).format('YYYY-MM-DD')}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleBanUser(user.id, user.status === 'banned')}
                            disabled={actionLoading === user.id}
                            className={`text-sm ${
                              user.status === 'banned' ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'
                            } disabled:opacity-50`}
                          >
                            {user.status === 'banned' ? '解封' : '封禁'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'topics' && (
            <div>
              <h2 className="text-lg font-bold mb-4">创建话题</h2>
              <form onSubmit={handleCreateTopic} className="max-w-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">话题标题</label>
                  <input
                    type="text"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    placeholder="请输入话题标题"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">话题描述</label>
                  <textarea
                    value={newTopicDesc}
                    onChange={(e) => setNewTopicDesc(e.target.value)}
                    placeholder="请输入话题描述（可选）"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingTopic || !newTopicTitle.trim()}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {submittingTopic ? '创建中...' : '创建话题'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <h2 className="text-lg font-bold mb-6">数据统计</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalUsers || 0}</div>
                  <div className="text-sm text-blue-600 mt-1">总用户数</div>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="text-3xl font-bold text-green-600">{stats.totalArticles || 0}</div>
                  <div className="text-sm text-green-600 mt-1">总文章数</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="text-3xl font-bold text-purple-600">{stats.totalQuestions || 0}</div>
                  <div className="text-sm text-purple-600 mt-1">总问答数</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="text-3xl font-bold text-orange-600">{stats.totalProjects || 0}</div>
                  <div className="text-sm text-orange-600 mt-1">总项目数</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
