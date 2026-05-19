import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { questionsApi, communityApi } from '../api';
import type { Question, Tag } from '../types';
import { QuestionCard } from '../components/Card';

export default function QuestionList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const page = Number(searchParams.get('page')) || 1;
  const tag = searchParams.get('tag');
  const status = searchParams.get('status');
  const sort = searchParams.get('sort') || 'latest';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: { page?: number; limit?: number; tag?: string; status?: string; sort?: string } = {
          page,
          limit: 20,
        };
        if (tag) params.tag = tag;
        if (status) params.status = status;
        if (sort) params.sort = sort;
        
        const [questionsRes, tagsRes] = await Promise.all([
          questionsApi.getList(params),
          communityApi.getTags(),
        ]);
        setQuestions(questionsRes.data.data);
        setTotal(questionsRes.data.total);
        setTags(tagsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [page, tag, status, sort]);

  const totalPages = Math.ceil(total / 20);

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    params.delete('page');
    setSearchParams(params);
  };

  const handleStatusChange = (newStatus: string) => {
    const params = new URLSearchParams(searchParams);
    if (newStatus) {
      params.set('status', newStatus);
    } else {
      params.delete('status');
    }
    params.delete('page');
    setSearchParams(params);
  };

  const handleTagClick = (tagName: string) => {
    const params = new URLSearchParams(searchParams);
    if (params.get('tag') === tagName) {
      params.delete('tag');
    } else {
      params.set('tag', tagName);
    }
    params.delete('page');
    setSearchParams(params);
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
              <button
                onClick={() => handleSortChange('unanswered')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sort === 'unanswered' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                待回答
              </button>
            </div>
            <Link
              to="/questions/create"
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
            >
              + 提问
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <span className="text-sm text-gray-500">状态：</span>
            <button
              onClick={() => handleStatusChange('')}
              className={`px-3 py-1 rounded text-sm ${
                !status ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => handleStatusChange('approved')}
              className={`px-3 py-1 rounded text-sm ${
                status === 'approved' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              进行中
            </button>
            <button
              onClick={() => handleStatusChange('resolved')}
              className={`px-3 py-1 rounded text-sm ${
                status === 'resolved' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
              }`}
            >
              已解决
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {questions.length > 0 ? (
            questions.map((question) => <QuestionCard key={question.id} question={question} />)
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-500">暂无问题</p>
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
          <h3 className="font-bold mb-4">🏷️ 热门标签</h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 30).map((t) => (
              <button
                key={t.id}
                onClick={() => handleTagClick(t.name)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  t.name === tag
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold mb-4">💡 提问规范</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• 清晰描述问题背景</li>
            <li>• 提供复现代码或截图</li>
            <li>• 说明已尝试的解决方案</li>
            <li>• 选择合适的标签</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
