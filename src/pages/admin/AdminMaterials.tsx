import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Loader2,
  ChevronDown,
  Download,
  Heart,
  Eye,
  Tag,
  Image as ImageIcon,
  FileText,
  CheckCircle
} from 'lucide-react';
import {
  getMaterials,
  getMaterialCategories,
  addMaterial,
  updateMaterial,
  deleteMaterial
} from '../../data/services';
import type { Material, MaterialCategory } from '../../types';

const AdminMaterials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPrice, setFilterPrice] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    fileType: 'image' as Material['fileType'],
    price: 0,
    tags: '',
    isActive: true
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [materialsData, categoriesData] = await Promise.all([
          getMaterials(),
          getMaterialCategories()
        ]);
        setMaterials(materialsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load materials:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredMaterials = materials.filter(material => {
    const matchesCategory = filterCategory === 'all' || material.categoryId === filterCategory;
    const matchesPrice = filterPrice === 'all' ||
      (filterPrice === 'free' && material.price === 0) ||
      (filterPrice === 'paid' && material.price > 0);
    const matchesSearch = searchQuery === '' ||
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
  });

  const handleAddNew = () => {
    setEditingMaterial(null);
    setFormData({
      title: '',
      description: '',
      categoryId: categories[0]?.id || '',
      fileType: 'image',
      price: 0,
      tags: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      description: material.description,
      categoryId: material.categoryId,
      fileType: material.fileType,
      price: material.price,
      tags: material.tags.join(', '),
      isActive: material.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个素材吗？此操作无法撤销。')) {
      try {
        await deleteMaterial(id);
        setMaterials(materials.filter(m => m.id !== id));
      } catch (error) {
        console.error('Failed to delete material:', error);
        alert('删除失败，请稍后重试');
      }
    }
  };

  const handleToggleActive = async (material: Material) => {
    try {
      const updated = { ...material, isActive: !material.isActive };
      await updateMaterial(updated);
      setMaterials(materials.map(m => m.id === material.id ? updated : m));
    } catch (error) {
      console.error('Failed to update material:', error);
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

      if (editingMaterial) {
        const updated: Material = {
          ...editingMaterial,
          title: formData.title,
          description: formData.description,
          categoryId: formData.categoryId,
          fileType: formData.fileType,
          price: formData.price,
          tags: tagsArray,
          isActive: formData.isActive
        };
        await updateMaterial(updated);
        setMaterials(materials.map(m => m.id === editingMaterial.id ? updated : m));
      } else {
        const newMaterial = {
          title: formData.title,
          description: formData.description,
          categoryId: formData.categoryId,
          thumbnail: '',
          fileUrl: '',
          fileType: formData.fileType,
          fileSize: 0,
          price: formData.price,
          tags: tagsArray,
          isActive: formData.isActive
        };
        const id = await addMaterial(newMaterial);
        const createdMaterial: Material = {
          ...newMaterial,
          id,
          downloadCount: 0,
          likeCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        setMaterials([createdMaterial, ...materials]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save material:', error);
      alert('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const getFileTypeLabel = (type: Material['fileType']) => {
    const labels: Record<Material['fileType'], string> = {
      image: '图片',
      vector: '矢量图',
      template: '模板',
      font: '字体',
      other: '其他'
    };
    return labels[type] || type;
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
          <h2 className="text-2xl font-bold text-gray-900">素材管理</h2>
          <p className="text-gray-500 mt-1">管理您的设计素材资源，设置免费或付费下载</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>添加素材</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总素材数</p>
              <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">免费素材</p>
              <p className="text-2xl font-bold text-gray-900">
                {materials.filter(m => m.price === 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总下载量</p>
              <p className="text-2xl font-bold text-gray-900">
                {materials.reduce((sum, m) => sum + m.downloadCount, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已上架</p>
              <p className="text-2xl font-bold text-gray-900">
                {materials.filter(m => m.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索素材名称或描述..."
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

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">全部分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">全部价格</option>
                  <option value="free">免费</option>
                  <option value="paid">付费</option>
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
                  素材
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型 / 价格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  数据
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  标签
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
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {material.thumbnail ? (
                            <img
                              src={material.thumbnail}
                              alt={material.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{material.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {material.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          {getFileTypeLabel(material.fileType)}
                        </p>
                        <p className={`text-lg font-semibold ${material.price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                          {material.price === 0 ? '免费' : `¥${material.price.toLocaleString()}`}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Download className="w-4 h-4" />
                          <span>{material.downloadCount.toLocaleString()} 下载</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600 mt-1">
                          <Heart className="w-4 h-4" />
                          <span>{material.likeCount.toLocaleString()} 收藏</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {material.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {material.tags.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{material.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          material.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {material.isActive ? '已上架' : '已下架'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleActive(material)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            material.isActive
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                          }`}
                          title={material.isActive ? '下架' : '上架'}
                        >
                          {material.isActive ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(material)}
                          className="p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(material.id)}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无素材</h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery || filterCategory !== 'all' || filterPrice !== 'all'
                        ? '没有找到匹配的素材，请尝试其他搜索条件'
                        : '开始添加您的第一个设计素材吧'}
                    </p>
                    {!searchQuery && filterCategory === 'all' && filterPrice === 'all' && (
                      <button
                        onClick={handleAddNew}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>添加素材</span>
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
                  {editingMaterial ? '编辑素材' : '添加素材'}
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
                      素材标题 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="输入素材标题"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      素材描述
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="描述这个素材"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      分类
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">选择分类</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      文件类型
                    </label>
                    <select
                      value={formData.fileType}
                      onChange={(e) => setFormData({ ...formData, fileType: e.target.value as Material['fileType'] })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="image">图片</option>
                      <option value="vector">矢量图</option>
                      <option value="template">模板</option>
                      <option value="font">字体</option>
                      <option value="other">其他</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      价格（¥）
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="0 表示免费"
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
                      placeholder="例如：UI素材, 图标, 扁平化"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">上架销售</span>
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
                      <span>{editingMaterial ? '保存修改' : '添加素材'}</span>
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

export default AdminMaterials;
