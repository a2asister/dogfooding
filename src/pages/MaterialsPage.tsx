import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  List,
  Download,
  Heart,
  ChevronDown,
  X,
  Lock,
  Tag,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  getMaterialCategories,
  getMaterials
} from '../data/services';
import type { Material, MaterialCategory } from '../types';

const MaterialsPage: React.FC = () => {
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'downloads' | 'date' | 'price'>('downloads');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const setIsLoading = useAppStore(state => state.setIsLoading);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setIsLoading(true);

      try {
        const [categoriesData, materialsData] = await Promise.all([
          getMaterialCategories(),
          getMaterials({ sortBy })
        ]);

        setCategories(categoriesData);
        setMaterials(materialsData);
      } catch (error) {
        console.error('Failed to load materials data:', error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    loadData();
  }, [setIsLoading, sortBy]);

  // Filter materials
  const filteredMaterials = materials.filter(material => {
    const matchesCategory = selectedCategory === 'all' || material.categoryId === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPrice = priceFilter === 'all' ||
      (priceFilter === 'free' && material.price === 0) ||
      (priceFilter === 'paid' && material.price > 0);

    return matchesCategory && matchesSearch && matchesPrice;
  });

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

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
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">素材资源</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              精选设计素材资源，包含图标、模板、字体、插画等，助力您的设计创作
            </p>
            <div className="flex items-center justify-center space-x-8 mt-8">
              <div className="text-center">
                <p className="text-3xl font-bold">{materials.length}</p>
                <p className="text-sm text-gray-400">素材总数</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{materials.filter(m => m.price === 0).length}</p>
                <p className="text-sm text-gray-400">免费素材</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{materials.reduce((sum, m) => sum + m.downloadCount, 0).toLocaleString()}</p>
                <p className="text-sm text-gray-400">总下载量</p>
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
                  placeholder="搜索素材名称、描述或标签..."
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

                {/* Price Filter */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPriceFilter('all')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${priceFilter === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => setPriceFilter('free')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${priceFilter === 'free' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    免费
                  </button>
                  <button
                    onClick={() => setPriceFilter('paid')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${priceFilter === 'paid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    付费
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'downloads' | 'date' | 'price')}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="downloads">按下载量</option>
                    <option value="date">按最新发布</option>
                    <option value="price">按价格排序</option>
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
                  全部素材
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

      {/* Materials Grid/List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-gray-600">
              找到 <span className="font-semibold text-gray-900">{filteredMaterials.length}</span> 个素材
            </p>
          </div>

          {filteredMaterials.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img
                        src={material.thumbnail || `https://picsum.photos/seed/material-${material.id}/400/300`}
                        alt={material.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Price Badge */}
                      <div className="absolute top-3 left-3">
                        {material.price === 0 ? (
                          <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                            免费
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                            ¥{material.price}
                          </span>
                        )}
                      </div>
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-3">
                          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors">
                            <Eye className="w-5 h-5 text-gray-700" />
                          </button>
                          {material.price === 0 ? (
                            <button className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors">
                              <Download className="w-5 h-5 text-white" />
                            </button>
                          ) : (
                            <button className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-colors">
                              <Lock className="w-5 h-5 text-white" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* File Type */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {material.fileType === 'image' ? '图片' :
                           material.fileType === 'vector' ? '矢量' :
                           material.fileType === 'template' ? '模板' :
                           material.fileType === 'font' ? '字体' : '其他'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatFileSize(material.fileSize)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                        {material.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                        {material.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {material.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="flex items-center space-x-1 px-2 py-0.5 bg-gray-50 rounded text-xs text-gray-500"
                          >
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>

                      {/* Stats & Action */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Download className="w-4 h-4" />
                            <span>{material.downloadCount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{material.likeCount.toLocaleString()}</span>
                          </div>
                        </div>
                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${material.price === 0 ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                          {material.price === 0 ? '立即下载' : `¥${material.price}`}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {filteredMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row"
                  >
                    {/* Thumbnail */}
                    <div className="sm:w-56 flex-shrink-0">
                      <div className="relative aspect-[4/3] sm:aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={material.thumbnail || `https://picsum.photos/seed/material-${material.id}/400/300`}
                          alt={material.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          {material.price === 0 ? (
                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                              免费
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                              ¥{material.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {material.fileType === 'image' ? '图片' :
                             material.fileType === 'vector' ? '矢量' :
                             material.fileType === 'template' ? '模板' :
                             material.fileType === 'font' ? '字体' : '其他'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatFileSize(material.fileSize)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(material.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {material.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {material.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {material.tags.slice(0, 5).map((tag, index) => (
                            <span
                              key={index}
                              className="flex items-center space-x-1 px-2 py-0.5 bg-gray-50 rounded text-xs text-gray-500"
                            >
                              <Tag className="w-3 h-3" />
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats & Action */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Download className="w-4 h-4" />
                            <span>{material.downloadCount.toLocaleString()} 下载</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{material.likeCount.toLocaleString()} 收藏</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                            预览
                          </button>
                          <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${material.price === 0 ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                            {material.price === 0 ? '立即下载' : `¥${material.price} 购买`}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Empty State
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">未找到素材</h3>
              <p className="text-gray-500 mb-6">
                请尝试使用其他关键词或筛选条件
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setPriceFilter('all');
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
            需要更多定制化素材？
          </h2>
          <p className="text-lg text-purple-100 mb-8">
            如果您需要特定类型的素材或定制化设计服务，欢迎联系我
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="inline-flex items-center justify-center space-x-2 bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <span>了解定制服务</span>
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

export default MaterialsPage;
