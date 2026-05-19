import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { articlesApi, communityApi } from '../api';
import type { Article, Tag, Topic } from '../types';
import { ArticleCard } from '../components/Card';

export default function ArticleList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const page = Number(searchParams.get('page')) || 1;
  const tag = searchParams.get('tag');
  const topic = searchParams.get('topic');
  const sort = searchParams.get('sort') || 'latest';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: { page?: number; limit?: number; tag?: string; topic?: number; sort?: string } = {
          page,
          limit: 20,
        };
        if (tag) params.tag = tag;
        if (topic) params.topic = Number(topic);
        if (sort) params.sort = sort;
        
        const [articlesRes, tagsRes, topicsRes] = await Promise.all([
          articlesApi.getList(params),
          communityApi.getTags(),
          communityApi.getTopics(),
        ]);
        setArticles(articlesRes.data.data);
        setTotal(articlesRes.data.total);
        setTags(tagsRes.data.data);
        setTopics(topicsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [page, tag, topic, sort]);

  const totalPages = Math.ceil(total / 20);

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    params.delete('page');
    setSearchParams(params);
  };

  const handleTagClick = (tagName: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tag', tagName);
    params.delete('page');
    setSearchParams(params);
  };

  const handleTopicClick = (topicId: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('topic', String(topicId));
    params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
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
      <div className="lg:col-span-3">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleSortChange('latest')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sort === 'latest' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                最新
              </button>
              <button
                onClick={() => handleSortChange('hot')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sort === 'hot' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                热门
              </button>
            </div>
            <Link
              to="/articles/create"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700"
            >
              + 发布文章
            </Link>
          </div>
          
          {(tag || topic) && (
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-sm text-gray-500">当前筛选：</span>
              {tag && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  标签: {tag}
                </span>
              )}
              {topic && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  话题: {topics.find((t) => t.id === Number(topic))?.title}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:underline"
              >
                清除筛选
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {articles.length > 0 ? (
            articles.map((article) => <ArticleCard key={article.id} article={article} />)
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-500">暂无文章</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            {page > 1 && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set('page', String(page - 1));
                  setSearchParams(params);
                }}
                className="px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50"
              >
                上一页
              </button>
            )}
            <span className="text-sm text-gray-500">
              第 {page} / {totalPages} 页
            </span>
            {page < totalPages && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set('page', String(page + 1));
                  setSearchParams(params);
                }}
                className="px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50"
              >
                下一页
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold mb-4">📚 话题</h3>
          <div className="space-y-2">
            {topics.slice(0, 10).map((t) => (
              <button
                key={t.id}
                onClick={() => handleTopicClick(t.id)}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  String(t.id) === topic
                    ? 'bg-primary-100 text-primary-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-sm">{t.title}</div>
                <div className="text-xs text-gray-500">{t.article_count} 篇文章</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold mb-4">🏷️ 标签</h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 30).map((t) => (
              <button
                key={t.id}
                onClick={() => handleTagClick(t.name)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  t.name === tag
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
