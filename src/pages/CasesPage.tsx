import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  ArrowRight,
  Tag,
  TrendingUp,
  Calendar,
  Briefcase,
  X
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  getCaseStudies
} from '../data/services';
import type { CaseStudy } from '../types';

const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);

  const setIsLoading = useAppStore(state => state.setIsLoading);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setIsLoading(true);

      try {
        const casesData = await getCaseStudies();
        setCases(casesData);
      } catch (error) {
        console.error('Failed to load case studies:', error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    loadData();
  }, [setIsLoading]);

  // Get all unique tags
  const allTags = Array.from(new Set(cases.flatMap(c => c.tags)));

  // Filter cases
  const filteredCases = cases.filter(caseStudy => {
    const matchesSearch = searchQuery === '' ||
      caseStudy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseStudy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseStudy.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseStudy.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTag = selectedTag === 'all' || caseStudy.tags.includes(selectedTag);
    const matchesFeatured = !showFeatured || caseStudy.isFeatured;

    return matchesSearch && matchesTag && matchesFeatured;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">项目案例</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              深入了解我为客户完成的设计项目，每个案例都展示了完整的设计过程与成果
            </p>
            <div className="flex items-center justify-center space-x-8 mt-8">
              <div className="text-center">
                <p className="text-3xl font-bold">{cases.length}</p>
                <p className="text-sm text-gray-400">案例总数</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{cases.filter(c => c.isFeatured).length}</p>
                <p className="text-sm text-gray-400">热门案例</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{cases.reduce((sum, c) => sum + c.viewCount, 0).toLocaleString()}</p>
                <p className="text-sm text-gray-400">总浏览量</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Section */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索案例名称、描述或客户..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center space-x-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  <span>筛选</span>
                </button>

                {/* Featured Toggle */}
                <button
                  onClick={() => setShowFeatured(!showFeatured)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg border transition-colors ${showFeatured ? 'bg-purple-50 border-purple-300 text-purple-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">热门推荐</span>
                </button>
              </div>
            </div>

            {/* Tag Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block mt-4`}>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedTag === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  全部
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedTag === tag ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cases Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-gray-600">
              找到 <span className="font-semibold text-gray-900">{filteredCases.length}</span> 个案例
            </p>
          </div>

          {filteredCases.length > 0 ? (
            <div className="space-y-8">
              {filteredCases.map((caseStudy) => (
                <Link
                  key={caseStudy.id}
                  to={`/cases/${caseStudy.id}`}
                  className="group block"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row">
                    {/* Image */}
                    <div className="lg:w-96 flex-shrink-0">
                      <div className="relative aspect-[16/9] lg:aspect-square overflow-hidden">
                        <img
                          src={caseStudy.processSteps[0]?.images[0] || `https://picsum.photos/seed/case-${caseStudy.id}/600/400`}
                          alt={caseStudy.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Featured Badge */}
                        {caseStudy.isFeatured && (
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium rounded-full flex items-center space-x-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>热门推荐</span>
                            </span>
                          </div>
                        )}
                        {/* View Count */}
                        <div className="absolute top-3 right-3">
                          <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                            <Eye className="w-3 h-3" />
                            <span>{caseStudy.viewCount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 lg:p-8">
                      {/* Meta Tags */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                          {caseStudy.projectType}
                        </span>
                        <span className="flex items-center space-x-1 text-gray-500 text-sm">
                          <Briefcase className="w-4 h-4" />
                          <span>{caseStudy.client}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-3">
                        {caseStudy.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {caseStudy.description}
                      </p>

                      {/* Process Steps Preview */}
                      {caseStudy.processSteps.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">项目阶段：</p>
                          <div className="flex flex-wrap gap-2">
                            {caseStudy.processSteps.slice(0, 4).map((step, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                  {step.step}
                                </span>
                                <span className="text-sm text-gray-600">{step.title}</span>
                                {index < Math.min(caseStudy.processSteps.length, 4) - 1 && (
                                  <ArrowRight className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {caseStudy.tags.slice(0, 5).map((tag, index) => (
                          <span
                            key={index}
                            className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                          >
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(caseStudy.startDate).toLocaleDateString('zh-CN', { month: 'short', year: 'numeric' })}
                              {' - '}
                              {new Date(caseStudy.endDate).toLocaleDateString('zh-CN', { month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-purple-600 font-medium">
                          <span>查看详情</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">未找到案例</h3>
              <p className="text-gray-500 mb-6">
                请尝试使用其他关键词或筛选条件
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag('all');
                  setShowFeatured(false);
                }}
                className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                <X className="w-4 h-4" />
                <span>清除所有筛选</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            想看到类似的项目成果？
          </h2>
          <p className="text-lg text-purple-100 mb-8">
            每个案例都经过精心设计，让您的项目也能脱颖而出
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="inline-flex items-center justify-center space-x-2 bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <span>了解服务</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center space-x-2 border border-white/50 text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              <span>联系我</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CasesPage;
