import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  X,
  Loader2,
  ChevronDown,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import {
  getPortfolios,
  getPortfolioCategories,
  addPortfolio,
  updatePortfolio,
  deletePortfolio
} from '../../data/services';
import type { Portfolio, PortfolioCategory } from '../../types';

const AdminPortfolios: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    concept: '',
    categoryId: '',
    tags: '',
    sortOrder: 0,
    isPublished: true,
    isTop: false
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [portfoliosData, categoriesData] = await Promise.all([
          getPortfolios(),
          getPortfolioCategories()
        ]);
        setPortfolios(portfoliosData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredPortfolios = portfolios.filter(portfolio => {
    const matchesCategory = selectedCategory === 'all' || portfolio.categoryId === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      portfolio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portfolio.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddNew = () => {
    setEditingPortfolio(null);
    setFormData({
      title: '',
      description: '',
      concept: '',
      categoryId: categories[0]?.id || '',
      tags: '',
      sortOrder: portfolios.length,
      isPublished: true,
      isTop: false
    });
    setShowModal(true);
  };

  const handleEdit = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setFormData({
      title: portfolio.title,
      description: portfolio.description,
      concept: portfolio.concept,
      categoryId: portfolio.categoryId,
      tags: portfolio.tags.join(', '),
      sortOrder: portfolio.sortOrder,
      isPublished: portfolio.isPublished,
      isTop: portfolio.isTop
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个作品吗？此操作无法撤销。')) {
      try {
        await deletePortfolio(id);
        setPortfolios(portfolios.filter(p => p.id !== id));
      } catch (error) {
        console.error('Failed to delete portfolio:', error);
        alert('删除失败，请稍后重试');
      }
    }
  };

  const handleTogglePublish = async (portfolio: Portfolio) => {
    try {
      const updated = { ...portfolio, isPublished: !portfolio.isPublished };
      await updatePortfolio(updated);
      setPortfolios(portfolios.map(p => p.id === portfolio.id ? updated : p));
    } catch (error) {
      console.error('Failed to update portfolio:', error);
    }
  };

  const handleToggleTop = async (portfolio: Portfolio) => {
    try {
      const updated = { ...portfolio, isTop: !portfolio.isTop };
      await updatePortfolio(updated);
      setPortfolios(portfolios.map(p => p.id === portfolio.id ? updated : p));
    } catch (error) {
      console.error('Failed to update portfolio:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t);

      if (editingPortfolio) {
        const updated: Portfolio = {
          ...editingPortfolio,
          title: formData.title,
          description: formData.description,
          concept: formData.concept,
          categoryId: formData.categoryId,
          tags: tagsArray,
          sortOrder: formData.sortOrder,
          isPublished: formData.isPublished,
          isTop: formData.isTop
        };
        await updatePortfolio(updated);
        setPortfolios(portfolios.map(p => p.id === editingPortfolio.id ? updated : p));
      } else {
        const newPortfolio = {
          title: formData.title,
          description: formData.description,
          concept: formData.concept,
          categoryId: formData.categoryId,
          parameters: [],
          images: [],
          detailImages: [],
          videos: [],
          tags: tagsArray,
          isPublished: formData.isPublished,
          isTop: formData.isTop,
          sortOrder: formData.sortOrder
        };
        const id = await addPortfolio(newPortfolio);
        const createdPortfolio: Portfolio = {
          ...newPortfolio,
          id,
          viewCount: 0,
          likeCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        setPortfolios([createdPortfolio, ...portfolios]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save portfolio:', error);
      alert('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">作品管理</h2>
          <p className="text-gray-500 mt-1">管理您的设计作品集，添加、编辑或删除作品</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>添加作品</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索作品..."
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
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">全部分类</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作品
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分类
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  标签
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  数据
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPortfolios.length > 0 ? (
                filteredPortfolios.map((portfolio) => (
                  <tr key={portfolio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {portfolio.images[0] ? (
                            <img
                              src={portfolio.images[0]}
                              alt={portfolio.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900 truncate">
                              {portfolio.title}
                            </p>
                            {portfolio.isTop && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                置顶
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {portfolio.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {categories.find(c => c.id === portfolio.categoryId)?.name || '未分类'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {portfolio.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {portfolio.tags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{portfolio.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{portfolio.viewCount.toLocaleString()} 浏览</p>
                        <p className="text-gray-500">{portfolio.likeCount.toLocaleString()} 喜欢</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          portfolio.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {portfolio.isPublished ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleTogglePublish(portfolio)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            portfolio.isPublished
                              ? 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                          }`}
                          title={portfolio.isPublished ? '取消发布' : '发布'}
                        >
                          {portfolio.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleToggleTop(portfolio)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            portfolio.isTop
                              ? 'text-purple-600 hover:bg-purple-50'
                              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                          }`}
                          title={portfolio.isTop ? '取消置顶' : '置顶'}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(portfolio)}
                          className="p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(portfolio.id)}
                          className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无作品</h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery || selectedCategory !== 'all'
                        ? '没有找到匹配的作品，请尝试其他搜索条件'
                        : '开始添加您的第一个设计作品吧'}
                    </p>
                    {!searchQuery && selectedCategory === 'all' && (
                      <button
                        onClick={handleAddNew}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>添加作品</span>
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />

            <div className="relative bg-white rounded-2xl shadow-xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingPortfolio ? '编辑作品' : '添加作品'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      作品标题 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="输入作品标题"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      作品描述 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="描述您的设计作品"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      创作理念
                    </label>
                    <textarea
                      rows={2}
                      value={formData.concept}
                      onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="描述您的创作理念"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      分类 <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">选择分类</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      排序
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      标签（用逗号分隔）
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="例如：UI设计, 移动应用, 简洁风格"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex flex-wrap items-center gap-6">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.isPublished}
                          onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">发布作品</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.isTop}
                          onChange={(e) => setFormData({ ...formData, isTop: e.target.checked })}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">置顶展示</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>保存中...</span>
                      </>
                    ) : (
                      <span>{editingPortfolio ? '保存修改' : '添加作品'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortfolios;
