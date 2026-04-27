import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Heart,
  ArrowRight,
  ChevronDown,
  X,
  TrendingUp
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  getPortfolioCategories,
  getPortfolios
} from '../data/services';
import type { Portfolio, PortfolioCategory } from '../types';

const PortfolioPage: React.FC = () => {
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'views' | 'date'>('views');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const setIsLoading = useAppStore(state => state.setIsLoading);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setIsLoading(true);

      try {
        const [categoriesData, portfoliosData] = await Promise.all([
          getPortfolioCategories(),
          getPortfolios({ isPublished: true, sortBy })
        ]);

        setCategories(categoriesData);
        setPortfolios(portfoliosData);
      } catch (error) {
        console.error('Failed to load portfolio data:', error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    loadData();
  }, [setIsLoading, sortBy]);

  // Filter portfolios
  const filteredPortfolios = portfolios.filter(portfolio => {
    const matchesCategory = selectedCategory === 'all' || portfolio.categoryId === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      portfolio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portfolio.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portfolio.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
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
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">设计作品</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              探索我的精选设计作品，每一个项目都凝聚着创意与专业的结合
            </p>
            <div className="flex items-center justify-center space-x-8 mt-8">
              <div className="text-center">
                <p className="text-3xl font-bold">{portfolios.length}</p>
                <p className="text-sm text-gray-400">作品总数</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{portfolios.reduce((sum, p) => sum + p.viewCount, 0).toLocaleString()}</p>
                <p className="text-sm text-gray-400">总浏览量</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{categories.length}</p>
                <p className="text-sm text-gray-400">作品分类</p>
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
                  placeholder="搜索作品名称、描述或标签..."
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

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'views' | 'date')}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="views">按浏览量</option>
                    <option value="date">按最新发布</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block mt-4`}>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  全部
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid/List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-gray-600">
              找到 <span className="font-semibold text-gray-900">{filteredPortfolios.length}</span> 个作品
            </p>
          </div>

          {filteredPortfolios.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPortfolios.map((portfolio) => (
                  <Link
                    key={portfolio.id}
                    to={`/portfolio/${portfolio.id}`}
                    className="group block"
                  >
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={portfolio.images[0] || `https://picsum.photos/seed/${portfolio.id}/600/400`}
                          alt={portfolio.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center justify-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg py-2 px-4">
                              <ArrowRight className="w-5 h-5 text-white" />
                              <span className="text-white font-medium">查看详情</span>
                            </div>
                          </div>
                        </div>
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {portfolio.isTop && (
                            <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-md">
                              置顶
                            </span>
                          )}
                        </div>
                        {/* Stats */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                            <Eye className="w-3 h-3" />
                            <span>{portfolio.viewCount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {portfolio.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                          {portfolio.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {portfolio.description}
                        </p>

                        {/* Stats Bar */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{portfolio.viewCount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{portfolio.likeCount.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(portfolio.createdAt).toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {filteredPortfolios.map((portfolio) => (
                  <Link
                    key={portfolio.id}
                    to={`/portfolio/${portfolio.id}`}
                    className="group block"
                  >
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="sm:w-72 flex-shrink-0">
                        <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden">
                          <img
                            src={portfolio.images[0] || `https://picsum.photos/seed/${portfolio.id}/600/400`}
                            alt={portfolio.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {portfolio.isTop && (
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded">
                                置顶
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {portfolio.tags.slice(0, 4).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                          {portfolio.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 line-clamp-2 mb-4">
                          {portfolio.description}
                        </p>

                        {/* Concept */}
                        {portfolio.concept && (
                          <p className="text-sm text-gray-500 mb-4">
                            <span className="font-medium text-gray-700">创作理念：</span>
                            {portfolio.concept}
                          </p>
                        )}

                        {/* Stats Bar */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{portfolio.viewCount.toLocaleString()} 浏览</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{portfolio.likeCount.toLocaleString()} 喜欢</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(portfolio.createdAt).toLocaleDateString('zh-CN')}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-purple-600 font-medium">
                            <span>查看详情</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            // Empty State
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">未找到作品</h3>
              <p className="text-gray-500 mb-6">
                请尝试使用其他关键词或筛选条件
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
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

      {/* Pagination / Load More */}
      {filteredPortfolios.length > 0 && (
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>持续更新中，更多精彩作品即将发布</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default PortfolioPage;
