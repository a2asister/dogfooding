import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { communityApi } from '../api';
import type { Collection } from '../types';

export default function CollectionList() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await communityApi.getCollections();
        setCollections(res.data.data.filter((c: Collection) => c.is_public === 1));
      } catch (error) {
        console.error('Failed to fetch collections:', error);
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
        <h1 className="text-2xl font-bold">专题合集</h1>
        <p className="text-gray-500 mt-2">精选优质内容合集，系统性学习</p>
      </div>

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={`/articles?collection=${collection.id}`}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {collection.cover ? (
                <img
                  src={collection.cover}
                  alt={collection.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center">
                  <span className="text-4xl">📚</span>
                </div>
              )}
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">{collection.title}</h3>
                {collection.description && (
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{collection.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={collection.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${collection.username}`}
                      alt={collection.username}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-500">{collection.username}</span>
                  </div>
                  <span className="text-sm text-gray-400">{collection.article_count} 篇文章</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">暂无合集</p>
        </div>
      )}
    </div>
  );
}
