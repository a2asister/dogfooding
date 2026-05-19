import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { communityApi } from '../api';
import type { Topic } from '../types';

export default function TopicList() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await communityApi.getTopics();
        setTopics(res.data.data.filter((t: Topic) => t.is_active === 1));
      } catch (error) {
        console.error('Failed to fetch topics:', error);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">话题聚合</h1>
        <p className="text-gray-500 mt-2">发现感兴趣的话题，参与讨论</p>
      </div>

      {topics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              to={`/articles?topic=${topic.id}`}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              {topic.cover && (
                <img
                  src={topic.cover}
                  alt={topic.title}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="font-bold text-lg mb-2">{topic.title}</h3>
              {topic.description && (
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{topic.description}</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{topic.article_count} 篇文章</span>
                <span className="text-primary-600">查看详情 →</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">暂无话题</p>
        </div>
      )}
    </div>
  );
}
