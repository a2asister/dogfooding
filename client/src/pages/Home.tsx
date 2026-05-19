import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articlesApi, projectsApi, communityApi } from '../api';
import type { Article, Project, Tag, Topic } from '../types';
import { ArticleCard, ProjectCard } from '../components/Card';
import { useAuthStore } from '../store';
import { authApi } from '../api';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [featured, setFeatured] = useState<{ pinned: Article[]; featured: Article[] }>({ pinned: [], featured: [] });
  const [tags, setTags] = useState<Tag[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const [showCheckInSuccess, setShowCheckInSuccess] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, projectsRes, featuredRes, tagsRes, topicsRes, profileRes] = await Promise.all([
          articlesApi.getList({ limit: 10, sort: 'hot' }),
          projectsApi.getList({ limit: 6 }),
          communityApi.getFeatured(),
          communityApi.getTags(),
          communityApi.getTopics(),
          user ? authApi.getProfile() : null,
        ]);
        setArticles(articlesRes.data.data);
        setProjects(projectsRes.data.data);
        setFeatured(featuredRes.data);
        setTags(tagsRes.data.data);
        setTopics(topicsRes.data.data);
        if (profileRes) {
          setHasCheckedIn(!!profileRes.data.hasCheckedIn);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [user]);

  const handleCheckIn = async () => {
    try {
      const res = await authApi.checkIn();
      if (res.data.success) {
        setShowCheckInSuccess(true);
        setHasCheckedIn(true);
        setTimeout(() => setShowCheckInSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        {user && !hasCheckedIn && (
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">每日签到</h3>
                <p className="text-primary-100">每日签到获得 5 积分，连续签到更有惊喜！</p>
              </div>
              <button
                onClick={handleCheckIn}
                className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {showCheckInSuccess ? '✓ 已签到' : '立即签到'}
              </button>
            </div>
            {showCheckInSuccess && (
              <p className="mt-2 text-green-200">🎉 签到成功！获得 5 积分</p>
            )}
          </div>
        )}

        {featured.pinned.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <span className="text-red-500 mr-2">📌</span>
              置顶文章
            </h2>
            <div className="space-y-4">
              {featured.pinned.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {featured.featured.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <span className="text-yellow-500 mr-2">⭐</span>
              精选内容
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featured.featured.slice(0, 4).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">🔥 热门文章</h2>
            <Link to="/articles" className="text-sm text-primary-600 hover:underline">
              查看更多
            </Link>
          </div>
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">🚀 共建项目</h2>
            <Link to="/projects" className="text-sm text-primary-600 hover:underline">
              查看更多
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {user && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt={user.username}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{user.username}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">
                    Lv.{user.level}
                  </span>
                  <span>{user.points} 积分</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                to="/articles/create"
                className="flex-1 bg-primary-600 text-white text-center py-2 rounded-lg text-sm hover:bg-primary-700"
              >
                写文章
              </Link>
              <Link
                to="/questions/create"
                className="flex-1 bg-green-600 text-white text-center py-2 rounded-lg text-sm hover:bg-green-700"
              >
                提问题
              </Link>
            </div>
          </div>
        )}

        {topics.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold mb-4">📚 热门话题</h3>
            <div className="space-y-2">
              {topics.slice(0, 6).map((topic) => (
                <Link
                  key={topic.id}
                  to={`/articles?topic=${topic.id}`}
                  className="block p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium text-sm">{topic.title}</div>
                  <div className="text-xs text-gray-500">{topic.article_count} 篇文章</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold mb-4">🏷️ 热门标签</h3>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 20).map((tag) => (
                <Link
                  key={tag.id}
                  to={`/articles?tag=${encodeURIComponent(tag.name)}`}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-primary-100 hover:text-primary-700 transition-colors"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold mb-4">🎯 积分等级</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>萌新开发者</span><span className="text-gray-500">0-99</span></div>
            <div className="flex justify-between"><span>初级开发者</span><span className="text-gray-500">100-499</span></div>
            <div className="flex justify-between"><span>中级开发者</span><span className="text-gray-500">500-1999</span></div>
            <div className="flex justify-between"><span>高级开发者</span><span className="text-gray-500">2000-4999</span></div>
            <div className="flex justify-between"><span>核心贡献者</span><span className="text-gray-500">5000-14999</span></div>
            <div className="flex justify-between"><span>社区大佬</span><span className="text-gray-500">15000+</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
