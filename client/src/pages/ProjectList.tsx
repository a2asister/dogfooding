import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { projectsApi, communityApi } from '../api';
import type { Project, Tag } from '../types';
import { ProjectCard } from '../components/Card';

export default function ProjectList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
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
        
        const [projectsRes, tagsRes] = await Promise.all([
          projectsApi.getList(params),
          communityApi.getTags(),
        ]);
        setProjects(projectsRes.data.data);
        setTotal(projectsRes.data.total);
        setTags(tagsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
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
                  sort === 'latest' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                最新
              </button>
              <button
                onClick={() => handleSortChange('hot')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sort === 'hot' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                热门
              </button>
            </div>
            <Link
              to="/projects/create"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700"
            >
              + 创建项目
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <span className="text-sm text-gray-500">状态：</span>
            <button
              onClick={() => handleStatusChange('')}
              className={`px-3 py-1 rounded text-sm ${
                !status ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => handleStatusChange('recruiting')}
              className={`px-3 py-1 rounded text-sm ${
                status === 'recruiting' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
              }`}
            >
              招募中
            </button>
            <button
              onClick={() => handleStatusChange('in_progress')}
              className={`px-3 py-1 rounded text-sm ${
                status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              进行中
            </button>
            <button
              onClick={() => handleStatusChange('completed')}
              className={`px-3 py-1 rounded text-sm ${
                status === 'completed' ? 'bg-gray-100 text-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              已完成
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.length > 0 ? (
            projects.map((project) => <ProjectCard key={project.id} project={project} />)
          ) : (
            <div className="col-span-2 bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-500">暂无项目</p>
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
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold mb-4">🚀 项目状态说明</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">招募中：正在寻找队友</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">进行中：项目开发中</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-gray-600">已完成：项目已完成</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
