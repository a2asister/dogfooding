import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search as SearchIcon,
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
  Clock,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SearchResult, Document } from '@/types';
import { documentApi } from '@/services/api';
import Layout from '@/components/Layout';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('请输入搜索关键词');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const data = await documentApi.search(query);
      setResults(data);
      if (data.length === 0) {
        toast('未找到相关文档', { icon: '📋' });
      } else {
        toast.success(`找到 ${data.length} 个相关文档`);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '搜索失败';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
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

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return 'text-green-600 bg-green-50';
    if (similarity >= 0.6) return 'text-yellow-600 bg-yellow-50';
    if (similarity >= 0.4) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      review: 'bg-yellow-100 text-yellow-700',
      published: 'bg-green-100 text-green-700',
      archived: 'bg-blue-100 text-blue-700',
    };
    const labels: Record<string, string> = {
      draft: '草稿',
      review: '审核中',
      published: '已发布',
      archived: '已归档',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  const highlightText = (text: string, keywords: string) => {
    if (!keywords.trim()) return text;
    
    const words = keywords.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const regex = new RegExp(`(${words.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      words.includes(part.toLowerCase()) ? (
        <mark key={index} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
      ) : part
    );
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">语义检索</h1>
          <p className="text-gray-500 mt-1">基于向量相似度智能搜索文档内容</p>
        </div>

        <div className="card">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                搜索关键词
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="query"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="input-field pl-10"
                    placeholder="输入关键词进行语义搜索，例如：如何配置用户权限..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex items-center gap-2 px-8"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <SearchIcon className="w-5 h-5" />
                  )}
                  <span>搜索</span>
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              提示：语义检索会理解您的查询意图，不仅匹配关键词，还会根据内容的语义相似度进行搜索。
            </p>
          </form>
        </div>

        {hasSearched && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                搜索结果
                {results.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (共 {results.length} 个结果)
                  </span>
                )}
              </h2>
            </div>

            {results.length === 0 ? (
              <div className="card text-center py-12">
                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关文档</h3>
                <p className="text-gray-500">请尝试使用其他关键词或调整搜索条件</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <Link
                    key={result.document.id}
                    to={`/documents/${result.document.id}`}
                    className="card hover:shadow-md transition-shadow duration-200 block"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getTypeIcon(result.document.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-gray-400 text-sm">#{index + 1}</span>
                          <h3 className="font-semibold text-gray-900 hover:text-primary-700 transition-colors">
                            {result.document.title}
                          </h3>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSimilarityColor(result.similarity)}`}>
                            相似度: {(result.similarity * 100).toFixed(1)}%
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                            {getTypeLabel(result.document.type)}
                          </span>
                          {getStatusBadge(result.document.lifecycle.status)}
                          <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(result.document.lifecycle.updatedAt).toLocaleDateString('zh-CN')}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {highlightText(truncateContent(result.document.content), query)}
                        </p>
                        {result.document.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {result.document.tags.slice(0, 5).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-primary-50 text-primary-600 rounded text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                            {result.document.tags.length > 5 && (
                              <span className="px-2 py-1 text-gray-400 text-xs">
                                +{result.document.tags.length - 5} 更多
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {!hasSearched && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">搜索示例</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                '用户权限配置',
                '代码实现示例',
                '数据分析报表',
                '技术文档模板',
                '项目计划书',
                'API 接口文档',
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(example)}
                  className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-primary-50 rounded-lg transition-colors text-left group"
                >
                  <SearchIcon className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
                  <span className="text-gray-700 group-hover:text-primary-700">{example}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
