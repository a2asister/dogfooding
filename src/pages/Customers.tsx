import React, { useState } from 'react';
import { Search, Eye, Edit, Plus, Star, TrendingUp, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils';
import type { Customer, CustomerType } from '@/types';
import { CUSTOMER_TYPE_NAMES } from '@/types';

const Customers: React.FC = () => {
  const { customers, updateCustomer, addCustomer } = useData();
  const { hasPermission } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || customer.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const customerTypeOptions = [
    { value: 'all', label: '全部类型' },
    { value: 'new', label: '新客户' },
    { value: 'regular', label: '老客户' },
    { value: 'vip', label: 'VIP客户' },
  ];

  const getCustomerTypeColor = (type: CustomerType) => {
    const map: Record<CustomerType, string> = {
      new: 'bg-blue-100 text-blue-800',
      regular: 'bg-green-100 text-green-800',
      vip: 'bg-yellow-100 text-yellow-800',
    };
    return map[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">客户管理</h1>
          <p className="text-gray-500 mt-1">管理客户信息、查看入住记录</p>
        </div>
        {hasPermission(['admin', 'manager', 'reception']) && (
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            新增客户
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总客户数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{customers.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">新客户</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{customers.filter(c => c.type === 'new').length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">老客户</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{customers.filter(c => c.type === 'regular').length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">VIP客户</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{customers.filter(c => c.type === 'vip').length}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索客户姓名、电话、邮箱..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
                />
              </div>
            </div>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={customerTypeOptions}
              className="w-40"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">客户</th>
                <th className="px-4 py-3 font-medium">电话</th>
                <th className="px-4 py-3 font-medium">邮箱</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">入住次数</th>
                <th className="px-4 py-3 font-medium">累计消费</th>
                <th className="px-4 py-3 font-medium">上次入住</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        customer.type === 'vip' ? 'bg-yellow-100' :
                        customer.type === 'regular' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <span className={`font-medium ${
                          customer.type === 'vip' ? 'text-yellow-600' :
                          customer.type === 'regular' ? 'text-green-600' : 'text-blue-600'
                        }`}>{customer.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        {customer.preferences && customer.preferences.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {customer.preferences.slice(0, 2).map((pref, idx) => (
                              <span key={idx} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                {pref}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{customer.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{customer.email || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs px-2 py-1 rounded-full ${getCustomerTypeColor(customer.type)}`}>
                      {CUSTOMER_TYPE_NAMES[customer.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{customer.totalStays} 次</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{formatCurrency(customer.totalSpent)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{customer.lastStayDate || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewCustomer(customer)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">没有找到匹配的客户</p>
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`客户详情 - ${selectedCustomer?.name}`}
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                selectedCustomer.type === 'vip' ? 'bg-yellow-100' :
                selectedCustomer.type === 'regular' ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                <span className={`text-2xl font-bold ${
                  selectedCustomer.type === 'vip' ? 'text-yellow-600' :
                  selectedCustomer.type === 'regular' ? 'text-green-600' : 'text-blue-600'
                }`}>{selectedCustomer.name[0]}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${getCustomerTypeColor(selectedCustomer.type)}`}>
                  {CUSTOMER_TYPE_NAMES[selectedCustomer.type]}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">联系电话</p>
                <p className="font-medium">{selectedCustomer.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">电子邮箱</p>
                <p className="font-medium">{selectedCustomer.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">证件类型</p>
                <p className="font-medium">{selectedCustomer.idType === 'id_card' ? '身份证' : '护照'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">证件号码</p>
                <p className="font-medium">{selectedCustomer.idNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">联系地址</p>
                <p className="font-medium">{selectedCustomer.address || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">注册时间</p>
                <p className="font-medium">{selectedCustomer.createdAt.split('T')[0]}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{selectedCustomer.totalStays}</p>
                  <p className="text-sm text-gray-500">入住次数</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{formatCurrency(selectedCustomer.totalSpent)}</p>
                  <p className="text-sm text-gray-500">累计消费</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{selectedCustomer.lastStayDate || '-'}</p>
                  <p className="text-sm text-gray-500">上次入住</p>
                </div>
              </div>
            </div>

            {selectedCustomer.preferences && selectedCustomer.preferences.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">消费偏好</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCustomer.preferences.map((pref, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedCustomer.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-2">备注</p>
                <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{selectedCustomer.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
                关闭
              </Button>
              <Button variant="primary" onClick={() => {
                setShowDetailModal(false);
                handleEditCustomer(selectedCustomer);
              }}>
                编辑客户
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="编辑客户信息"
        size="lg"
      >
        {selectedCustomer && (
          <EditCustomerForm
            customer={selectedCustomer}
            onSubmit={(updatedCustomer) => {
              updateCustomer(updatedCustomer);
              setShowEditModal(false);
            }}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

interface EditCustomerFormProps {
  customer: Customer;
  onSubmit: (customer: Customer) => void;
  onCancel: () => void;
}

const EditCustomerForm: React.FC<EditCustomerFormProps> = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: customer.name,
    phone: customer.phone,
    email: customer.email || '',
    idType: customer.idType,
    idNumber: customer.idNumber,
    type: customer.type,
    address: customer.address || '',
    notes: customer.notes || '',
    preferences: customer.preferences?.join(', ') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCustomer: Customer = {
      ...customer,
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      idType: formData.idType,
      idNumber: formData.idNumber,
      type: formData.type,
      address: formData.address || undefined,
      notes: formData.notes || undefined,
      preferences: formData.preferences ? formData.preferences.split(',').map(p => p.trim()).filter(Boolean) : undefined,
    };
    onSubmit(updatedCustomer);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="客户姓名"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="联系电话"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
        <Input
          label="电子邮箱"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Select
          label="客户类型"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as CustomerType })}
          options={[
            { value: 'new', label: '新客户' },
            { value: 'regular', label: '老客户' },
            { value: 'vip', label: 'VIP客户' },
          ]}
        />
        <Select
          label="证件类型"
          value={formData.idType}
          onChange={(e) => setFormData({ ...formData, idType: e.target.value as any })}
          options={[
            { value: 'id_card', label: '身份证' },
            { value: 'passport', label: '护照' },
          ]}
        />
        <Input
          label="证件号码"
          value={formData.idNumber}
          onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
          required
        />
      </div>
      
      <Input
        label="联系地址"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      />
      
      <Input
        label="消费偏好 (用逗号分隔)"
        value={formData.preferences}
        onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
        hint="例如: 无烟房, 高楼层, 大床"
      />
      
      <TextArea
        label="备注"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={3}
      />
      
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" variant="primary">
          保存修改
        </Button>
      </div>
    </form>
  );
};

export default Customers;
