import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Loader2,
  Package,
  Clock,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import {
  getServicePackages,
  addServicePackage,
  updateServicePackage,
  deleteServicePackage
} from '../../data/services';
import type { ServicePackage } from '../../types';

const AdminPackages: React.FC = () => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'CNY',
    features: '',
    deliveryDays: 7,
    revisionLimit: 2,
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getServicePackages();
        setPackages(data);
      } catch (error) {
        console.error('Failed to load packages:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = searchQuery === '' ||
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAddNew = () => {
    setEditingPackage(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      currency: 'CNY',
      features: '',
      deliveryDays: 7,
      revisionLimit: 2,
      isActive: true,
      sortOrder: packages.length
    });
    setShowModal(true);
  };

  const handleEdit = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      currency: pkg.currency,
      features: pkg.features.join('\n'),
      deliveryDays: pkg.deliveryDays,
      revisionLimit: pkg.revisionLimit,
      isActive: pkg.isActive,
      sortOrder: pkg.sortOrder
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个套餐吗？此操作无法撤销。')) {
      try {
        await deleteServicePackage(id);
        setPackages(packages.filter(p => p.id !== id));
      } catch (error) {
        console.error('Failed to delete package:', error);
        alert('删除失败，请稍后重试');
      }
    }
  };

  const handleToggleActive = async (pkg: ServicePackage) => {
    try {
      const updated = { ...pkg, isActive: !pkg.isActive };
      await updateServicePackage(updated);
      setPackages(packages.map(p => p.id === pkg.id ? updated : p));
    } catch (error) {
      console.error('Failed to update package:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const featuresArray = formData.features
        .split('\n')
        .map(f => f.trim())
        .filter(f => f);

      if (editingPackage) {
        const updated: ServicePackage = {
          ...editingPackage,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          currency: formData.currency,
          features: featuresArray,
          deliveryDays: formData.deliveryDays,
          revisionLimit: formData.revisionLimit,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder
        };
        await updateServicePackage(updated);
        setPackages(packages.map(p => p.id === editingPackage.id ? updated : p));
      } else {
        const newPackage = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          currency: formData.currency,
          features: featuresArray,
          deliveryDays: formData.deliveryDays,
          revisionLimit: formData.revisionLimit,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder
        };
        const id = await addServicePackage(newPackage);
        const createdPackage: ServicePackage = {
          ...newPackage,
          id,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        setPackages([createdPackage, ...packages]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save package:', error);
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
          <h2 className="text-2xl font-bold text-gray-900">服务套餐管理</h2>
          <p className="text-gray-500 mt-1">管理您的设计服务套餐，设置价格和服务内容</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>添加套餐</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总套餐数</p>
              <p className="text-2xl font-bold text-gray-900">{packages.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已上架</p>
              <p className="text-2xl font-bold text-gray-900">
                {packages.filter(p => p.isActive).length}
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
              <p className="text-sm text-gray-500">平均价格</p>
              <p className="text-2xl font-bold text-gray-900">
                ¥{packages.length > 0
                  ? Math.round(packages.reduce((sum, p) => sum + p.price, 0) / packages.length).toLocaleString()
                  : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索套餐名称或描述..."
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  套餐
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  价格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  服务内容
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  交付 / 修改
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
              {filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{pkg.name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {pkg.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-semibold text-gray-900">
                        ¥{pkg.price.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {pkg.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </div>
                        ))}
                        {pkg.features.length > 3 && (
                          <p className="text-xs text-gray-400">
                            +{pkg.features.length - 3} 更多服务
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{pkg.deliveryDays} 天交付</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600 mt-1">
                          <Edit className="w-4 h-4" />
                          <span>{pkg.revisionLimit} 次修改</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pkg.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {pkg.isActive ? '已上架' : '已下架'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleActive(pkg)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            pkg.isActive
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                          }`}
                          title={pkg.isActive ? '下架' : '上架'}
                        >
                          {pkg.isActive ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(pkg)}
                          className="p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无套餐</h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery
                        ? '没有找到匹配的套餐，请尝试其他搜索条件'
                        : '开始添加您的第一个设计服务套餐吧'}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={handleAddNew}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>添加套餐</span>
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
                  {editingPackage ? '编辑套餐' : '添加套餐'}
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
                      套餐名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="例如：基础设计套餐"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      套餐描述 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="描述这个套餐包含的服务"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      价格（¥） <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      交付天数
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.deliveryDays}
                      onChange={(e) => setFormData({ ...formData, deliveryDays: parseInt(e.target.value) || 7 })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      修改次数限制
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.revisionLimit}
                      onChange={(e) => setFormData({ ...formData, revisionLimit: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      服务特性（每行一个）
                    </label>
                    <textarea
                      rows={4}
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="例如：
3页设计稿
2次修改
源文件交付
"
                    />
                    <p className="text-xs text-gray-500 mt-1">每行输入一个服务特性，例如"3页设计稿"</p>
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
                      <span>{editingPackage ? '保存修改' : '添加套餐'}</span>
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

export default AdminPackages;
