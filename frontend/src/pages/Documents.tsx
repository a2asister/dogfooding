import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
  Clock,
  Trash2,
  Edit3,
  Eye,
  Filter,
  Plus,
  Search,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Document } from '@/types';
import { documentApi } from '@/services/api';
import Layout from '@/components/Layout';

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: 'all',
    status: 'all',
    search: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, filter]);

  const fetchDocuments = async () => {
    try {
      const data = await documentApi.getAll();
      const sorted = [...data].sort(
        (a, b) => new Date(b.lifecycle.updatedAt).getTime() - new Date(a.lifecycle.updatedAt).getTime()
      );
      setDocuments(sorted);
    } catch (error) {
      console.error('获取文档列表失败:', error);
      toast.error('获取文档列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...documents];

    if (filter.type !== 'all') {
      result = result.filter(d => d.type === filter.type);
    }

    if (filter.status !== 'all') {
      result = result.filter(d => d.lifecycle.status === filter.status);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(
        d =>
          d.title.toLowerCase().includes(searchLower) ||
          d.content.toLowerCase().includes(searchLower) ||
          d.tags.some(t => t.toLowerCase().includes(searchLower))
      );
    }

    setFilteredDocs(result);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await documentApi.delete(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('文档已删除');
      setDeleteConfirm(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '删除失败';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      case 'code':
        return <FileCode className="w-5 h-5 text-blue-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      pdf: 'PDF',
      excel: 'Excel',
      code: '代码',
      text: '文本',
    };
    return labels[type] || type.toUpperCase();
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: '草稿',
      review: '审核中',
      published: '已发布',
      archived: '已归档',
    };
    return labels[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      review: 'bg-yellow-100 text-yellow-700',
      published: 'bg-green-100 text-green-700',
      archived: 'bg-blue-100 text-blue-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  const uniqueTypes = ['all', ...Array.from(new Set(documents.map(d => d.type)))];
  const uniqueStatuses = ['all', ...Array.from(new Set(documents.map(d => d.lifecycle.status)))];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">文档管理</h1>
            <p className="text-gray-500 mt-1">查看和管理所有文档</p>
          </div>
          <Link to="/upload" className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span>上传文档</span>
          </Link>
        </div>

        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filter.search}
                  onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                  className="input-field pl-10"
                  placeholder="搜索文档标题、内容或标签..."
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filter.type}
                  onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                  className="input-field text-sm"
                >
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? '全部类型' : getTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                className="input-field text-sm"
              >
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? '全部状态' : getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          显示 {filteredDocs.length} / {documents.length} 个文档
        </div>

        {filteredDocs.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {documents.length === 0 ? '暂无文档' : '没有找到匹配的文档'}
            </h3>
            <p className="text-gray-500 mb-4">
              {documents.length === 0
                ? '上传您的第一个文档开始使用'
                : '请调整搜索条件或筛选器'}
            </p>
            {documents.length === 0 && (
              <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>上传文档</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="card hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/documents/${doc.id}`}
                          className="font-semibold text-gray-900 hover:text-primary-700 transition-colors"
                        >
                          {doc.title}
                        </Link>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          {getTypeLabel(doc.type)}
                        </span>
                        {getStatusBadge(doc.lifecycle.status)}
                        <span className="text-xs text-gray-400">
                          v{doc.lifecycle.version}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/documents/${doc.id}`}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="查看"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/documents/${doc.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(doc.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>更新于 {new Date(doc.lifecycle.updatedAt).toLocaleString('zh-CN')}</span>
                      </div>
                      <div>
                        创建于 {new Date(doc.lifecycle.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {doc.tags.slice(0, 5).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-50 text-primary-600 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                        {doc.tags.length > 5 && (
                          <span className="px-2 py-1 text-gray-400 text-xs">
                            +{doc.tags.length - 5} 更多
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="card w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">确认删除</h3>
              <p className="text-gray-500 mb-6">
                确定要删除这个文档吗？此操作不可撤销。
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={isDeleting}
                  className="btn-danger flex items-center gap-2"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>确认删除</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Documents;
