import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { communityApi } from '../api';
import type { User, Article, Project, Badge, LevelConfig } from '../types';
import { ArticleCard, ProjectCard } from '../components/Card';

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState<(User & { articles: Article[]; projects: Project[]; badges: Badge[] }) | null>(null);
  const [levels, setLevels] = useState<LevelConfig[]>([]);
  const [activeTab, setActiveTab] = useState<'articles' | 'projects'>('articles');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [userRes, levelsRes] = await Promise.all([
          communityApi.getUserProfile(Number(id)),
          communityApi.getLevels(),
        ]);
        setUser(userRes.data);
        setLevels(levelsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [id]);

  const getLevelName = (level: number) => {
    const l = levels.find(l => l.level === level);
    return l?.name || `Lv.${level}`;
  };

  const getLevelProgress = (points: number, level: number) => {
    const currentLevel = levels.find(l => l.level === level);
    const nextLevel = levels.find(l => l.level === level + 1);
    if (!currentLevel || !nextLevel) return 100;
    const progress = ((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <p className="text-gray-500">用户不存在</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex items-start space-x-6">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt={user.username}
              className="w-24 h-24 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold">{user.username}</h1>
                {user.role === 'admin' && (
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">
                    管理员
                  </span>
                )}
                {user.status === 'banned' && (
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                    已封禁
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                  {getLevelName(user.level)}
                </span>
                <span>积分: {user.points}</span>
                <span>加入于 {dayjs(user.created_at).format('YYYY-MM-DD')}</span>
              </div>
              {user.bio && (
                <p className="mt-4 text-gray-600">{user.bio}</p>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{user.articles.length}</div>
              <div className="text-sm text-gray-500">文章</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{user.projects.length}</div>
              <div className="text-sm text-gray-500">项目</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{user.badges.length}</div>
              <div className="text-sm text-gray-500">徽章</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">等级进度</span>
              <span className="text-gray-500">{user.points} 分</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${getLevelProgress(user.points, user.level)}%` }}
              />
            </div>
          </div>
        </div>

        {user.badges.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="font-bold mb-4">🏅 获得徽章</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {user.badges.map((badge) => (
                <div key={badge.id} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">{badge.icon || '🎖️'}</div>
                  <div className="font-medium text-sm">{badge.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{badge.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('articles')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'articles'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              文章 ({user.articles.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              项目 ({user.projects.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'articles' ? (
              user.articles.length > 0 ? (
                <div className="space-y-4">
                  {user.articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  暂无文章
                </div>
              )
            ) : (
              user.projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  暂无项目
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold mb-4">📊 等级体系</h3>
          <div className="space-y-3">
            {levels.map((level) => (
              <div
                key={level.level}
                className={`flex items-center justify-between p-2 rounded ${
                  level.level === user.level ? 'bg-primary-50' : ''
                }`}
              >
                <span className={`text-sm ${level.level === user.level ? 'text-primary-600 font-medium' : 'text-gray-600'}`}>
                  {level.name}
                </span>
                <span className="text-xs text-gray-400">{level.minPoints}+ 分</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
