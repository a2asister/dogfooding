import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowUp,
  X,
  Loader2,
  ChevronDown,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import {
  getCaseStudies,
  addCaseStudy,
  updateCaseStudy,
  deleteCaseStudy
} from '../../data/services';
import type { CaseStudy } from '../../types';

const AdminCases: React.FC = () => {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client: '',
    projectType: '',
    tags: '',
    sortOrder: 0,
    isFeatured: false
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const casesData = await getCaseStudies();
        setCases(casesData);
      } catch (error) {
        console.error('Failed to load case studies:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredCases = cases.filter(cs => {
    const matchesSearch = searchQuery === '' ||
      cs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cs.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cs.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFeatured = filterFeatured === 'all' || cs.isFeatured;
    return matchesSearch && matchesFeatured;
  });

  const handleAddNew = () => {
    setEditingCase(null);
    setFormData({
      title: '',
      description: '',
      client: '',
      projectType: '',
      tags: '',
      sortOrder: cases.length,
      isFeatured: false
    });
    setShowModal(true);
  };

  const handleEdit = (caseStudy: CaseStudy) => {
    setEditingCase(caseStudy);
    setFormData({
      title: caseStudy.title,
      description: caseStudy.description,
      client: caseStudy.client,
      projectType: caseStudy.projectType,
      tags: caseStudy.tags.join(', '),
      sortOrder: caseStudy.sortOrder,
      isFeatured: caseStudy.isFeatured
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个案例吗？此操作无法撤销。')) {
      try {
        await deleteCaseStudy(id);
        setCases(cases.filter(c => c.id !== id));
      } catch (error) {
        console.error('Failed to delete case study:', error);
        alert('删除失败，请稍后重试');
      }
    }
  };

  const handleToggleFeatured = async (caseStudy: CaseStudy) => {
    try {
      const updated = { ...caseStudy, isFeatured: !caseStudy.isFeatured };
      await updateCaseStudy(updated);
      setCases(cases.map(c => c.id === caseStudy.id ? updated : c));
    } catch (error) {
      console.error('Failed to update case study:', error);
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

      if (editingCase) {
        const updated: CaseStudy = {
          ...editingCase,
          title: formData.title,
          description: formData.description,
          client: formData.client,
          projectType: formData.projectType,
          tags: tagsArray,
          sortOrder: formData.sortOrder,
          isFeatured: formData.isFeatured
        };
        await updateCaseStudy(updated);
        setCases(cases.map(c => c.id === editingCase.id ? updated : c));
      } else {
        const newCase = {
          title: formData.title,
          description: formData.description,
          client: formData.client,
          projectType: formData.projectType,
          startDate: Date.now(),
          endDate: Date.now(),
          processSteps: [],
          beforeAfter: [],
          tags: tagsArray,
          isFeatured: formData.isFeatured,
          sortOrder: formData.sortOrder
        };
        const id = await addCaseStudy(newCase);
        const createdCase: CaseStudy = {
          ...newCase,
          id,
          viewCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        setCases([createdCase, ...cases]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save case study:', error);
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
          <h2 className="text-2xl font-bold text-gray-900">案例管理</h2>
          <p className="text-gray-500 mt-1">管理您的设计项目案例，展示项目成果和过程</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>添加案例</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索案例名称、客户或描述..."
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
                  value={filterFeatured}
                  onChange={(e) => setFilterFeatured(e.target.value as 'all' | 'featured')}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">全部案例</option>
                  <option value="featured">热门推荐</option>
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
                  案例
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户 / 类型
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
              {filteredCases.length > 0 ? (
                filteredCases.map((caseStudy) => (
                  <tr key={caseStudy.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {caseStudy.processSteps[0]?.images[0] ? (
                            <img
                              src={caseStudy.processSteps[0].images[0]}
                              alt={caseStudy.title}
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
                              {caseStudy.title}
                            </p>
                            {caseStudy.isFeatured && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                                热门
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {caseStudy.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{caseStudy.client}</p>
                        <p className="text-sm text-gray-500">{caseStudy.projectType}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {caseStudy.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {caseStudy.tags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{caseStudy.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{caseStudy.viewCount.toLocaleString()} 浏览</p>
                        <p className="text-gray-500">
                          {new Date(caseStudy.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        已发布
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleFeatured(caseStudy)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            caseStudy.isFeatured
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                          }`}
                          title={caseStudy.isFeatured ? '取消推荐' : '设为推荐'}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(caseStudy)}
                          className="p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(caseStudy.id)}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无案例</h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery || filterFeatured === 'featured'
                        ? '没有找到匹配的案例，请尝试其他搜索条件'
                        : '开始添加您的第一个设计项目案例吧'}
                    </p>
                    {!searchQuery && filterFeatured === 'all' && (
                      <button
                        onClick={handleAddNew}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>添加案例</span>
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
                  {editingCase ? '编辑案例' : '添加案例'}
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
                      案例标题 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="输入案例标题"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      案例描述 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="描述这个设计项目"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      客户名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="例如：某科技公司"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      项目类型 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="例如：品牌全案设计"
                    />
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
                      placeholder="例如：品牌设计, VI设计, 企业形象"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">设为热门推荐</span>
                    </label>
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
                      <span>{editingCase ? '保存修改' : '添加案例'}</span>
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

export default AdminCases;
