import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Shield,
  Activity,
  X,
  Loader2,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone,
  Globe,
  History
} from 'lucide-react';
import {
  getUsers,
  addUser,
  updateUser,
  getLoginRecords,
  getOperationLogs
} from '../../data/services';
import { PERMISSIONS } from '../../types';
import type { User, LoginRecord, OperationLog } from '../../types';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserLogs, setSelectedUserLogs] = useState<{ user: User; records: LoginRecord[]; logs: OperationLog[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'sub_user' as User['role'],
    permissions: [] as string[],
    isActive: true
  });

  const loadData = async () => {
    try {
      const [usersData, , logsData] = await Promise.all([
        getUsers(),
        getLoginRecords('demo-user-id', 20),
        getOperationLogs({ limit: 20 })
      ]);

      setUsers(usersData);
      setOperationLogs(logsData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '管理员';
      case 'designer': return '设计师';
      case 'sub_user': return '子账号';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'designer': return 'bg-purple-100 text-purple-700';
      case 'sub_user': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'sub_user',
      permissions: [],
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleViewLogs = async (user: User) => {
    try {
      const [records, logs] = await Promise.all([
        getLoginRecords(user.id, 20),
        getOperationLogs({ userId: user.id, limit: 20 })
      ]);
      setSelectedUserLogs({ user, records, logs });
      setShowLogsModal(true);
    } catch (error) {
      console.error('Failed to load user logs:', error);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const updated = { ...user, isActive: !user.isActive };
      await updateUser(updated);
      setUsers(users.map(u => u.id === user.id ? updated : u));
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingUser) {
        const updated: User = {
          ...editingUser,
          username: formData.username,
          email: formData.email,
          role: formData.role,
          permissions: formData.permissions,
          isActive: formData.isActive,
          updatedAt: Date.now()
        };
        await updateUser(updated);
        setUsers(users.map(u => u.id === editingUser.id ? updated : u));
      } else {
        const newUser = {
          username: formData.username,
          email: formData.email,
          passwordHash: btoa(formData.password),
          role: formData.role,
          permissions: formData.permissions,
          isActive: formData.isActive
        };
        const id = await addUser(newUser);
        const createdUser: User = {
          ...newUser,
          id,
          lastLoginAt: null,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        setUsers([createdUser, ...users]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const getPermissionCategory = (permission: string) => {
    const category = permission.split(':')[0];
    const categories: Record<string, string> = {
      portfolio: '作品管理',
      case_study: '案例管理',
      order: '订单管理',
      chat: '聊天消息',
      review: '评价管理',
      material: '素材管理',
      analytics: '数据统计',
      user: '用户管理',
      sub_user: '子账号管理',
      settings: '系统设置'
    };
    return categories[category] || '其他';
  };

  const permissionsByCategory = PERMISSIONS.reduce((acc, permission) => {
    const category = getPermissionCategory(permission);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, string[]>);

  const getPermissionLabel = (permission: string) => {
    const labels: Record<string, string> = {
      'portfolio:read': '查看作品',
      'portfolio:write': '编辑作品',
      'portfolio:delete': '删除作品',
      'case_study:read': '查看案例',
      'case_study:write': '编辑案例',
      'case_study:delete': '删除案例',
      'order:read': '查看订单',
      'order:write': '编辑订单',
      'order:delete': '删除订单',
      'chat:read': '查看消息',
      'chat:write': '发送消息',
      'review:read': '查看评价',
      'review:write': '回复评价',
      'material:read': '查看素材',
      'material:write': '编辑素材',
      'material:delete': '删除素材',
      'analytics:read': '查看统计',
      'user:read': '查看用户',
      'user:write': '编辑用户',
      'user:delete': '删除用户',
      'sub_user:read': '查看子账号',
      'sub_user:write': '编辑子账号',
      'sub_user:delete': '删除子账号',
      'settings:read': '查看设置',
      'settings:write': '编辑设置'
    };
    return labels[permission] || permission;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">权限账号</h2>
          <p className="text-gray-500 mt-1">管理用户账号、权限分配和操作日志</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>添加账号</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'text-purple-600 border-purple-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>账号管理</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'text-purple-600 border-purple-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>操作日志</span>
          </div>
        </button>
      </div>

      {activeTab === 'users' ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">总账号数</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">活跃账号</p>
                  <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.isActive).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">管理员账号</p>
                  <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索用户名或邮箱..."
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

                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">全部角色</option>
                    <option value="admin">管理员</option>
                    <option value="designer">设计师</option>
                    <option value="sub_user">子账号</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      角色
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      权限
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最后登录
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.username}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.permissions.slice(0, 3).map((perm, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {getPermissionLabel(perm)}
                              </span>
                            ))}
                            {user.permissions.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{user.permissions.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {user.isActive ? (
                              <><CheckCircle className="w-3 h-3 mr-1" /> 活跃</>
                            ) : (
                              <><XCircle className="w-3 h-3 mr-1" /> 禁用</>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {user.lastLoginAt ? (
                              <>
                                <p className="text-gray-900">{formatDate(user.lastLoginAt)}</p>
                              </>
                            ) : (
                              <p className="text-gray-400">从未登录</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewLogs(user)}
                              className="p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                              title="查看日志"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(user)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                user.isActive
                                  ? 'text-gray-400 hover:bg-orange-50 hover:text-orange-600'
                                  : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                              }`}
                              title={user.isActive ? '禁用账号' : '启用账号'}
                            >
                              {user.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                              title="编辑"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无账号</h3>
                        <p className="text-gray-500 mb-4">
                          {searchQuery || selectedRole !== 'all'
                            ? '没有找到匹配的账号，请尝试其他搜索条件'
                            : '开始添加您的第一个账号吧'}
                        </p>
                        {!searchQuery && selectedRole === 'all' && (
                          <button
                            onClick={handleAddNew}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>添加账号</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Operation Logs Tab */
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">操作日志</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {operationLogs.length > 0 ? (
              operationLogs.map((log, index) => (
                <div key={log.id || index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      log.action === 'create' ? 'bg-green-100' :
                      log.action === 'update' ? 'bg-blue-100' :
                      log.action === 'delete' ? 'bg-red-100' :
                      'bg-gray-100'
                    }`}>
                      <Activity className={`w-5 h-5 ${
                        log.action === 'create' ? 'text-green-600' :
                        log.action === 'update' ? 'text-blue-600' :
                        log.action === 'delete' ? 'text-red-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">
                          {log.username}
                          <span className={`inline-flex items-center ml-2 px-2 py-0.5 text-xs rounded-full ${
                            log.action === 'create' ? 'bg-green-100 text-green-700' :
                            log.action === 'update' ? 'bg-blue-100 text-blue-700' :
                            log.action === 'delete' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {log.action === 'create' ? '创建' :
                             log.action === 'update' ? '更新' :
                             log.action === 'delete' ? '删除' : log.action}
                          </span>
                        </p>
                        <span className="text-xs text-gray-400">{formatDate(log.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <span>{log.ipAddress}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Smartphone className="w-3 h-3" />
                          <span className="truncate max-w-xs">{log.userAgent}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无操作日志</h3>
                <p className="text-gray-500">操作记录将在此处显示</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />

            <div className="relative bg-white rounded-2xl shadow-xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingUser ? '编辑账号' : '添加账号'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        用户名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="输入用户名"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        邮箱 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="输入邮箱"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        密码 {!editingUser && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="password"
                        required={!editingUser}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder={editingUser ? '留空表示不修改密码' : '输入密码'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        角色 <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="sub_user">子账号</option>
                        <option value="designer">设计师</option>
                        <option value="admin">管理员</option>
                      </select>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      权限设置
                    </label>
                    <div className="space-y-4 max-h-64 overflow-y-auto p-4 border border-gray-200 rounded-lg">
                      {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                        <div key={category}>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                          <div className="flex flex-wrap gap-2">
                            {permissions.map((permission) => (
                              <label
                                key={permission}
                                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                                  formData.permissions.includes(permission)
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.permissions.includes(permission)}
                                  onChange={() => togglePermission(permission)}
                                  className="sr-only"
                                />
                                <span className="text-sm">{getPermissionLabel(permission)}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, permissions: PERMISSIONS as string[] })}
                        className="text-sm text-purple-600 hover:text-purple-700"
                      >
                        全选
                      </button>
                      <span className="mx-2 text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, permissions: [] })}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        清除
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">启用账号</span>
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
                      <span>{editingUser ? '保存修改' : '添加账号'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Logs Modal */}
      {showLogsModal && selectedUserLogs && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowLogsModal(false)} />

            <div className="relative bg-white rounded-2xl shadow-xl transform transition-all sm:my-8 sm:max-w-3xl sm:w-full max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">账号日志</h3>
                  <p className="text-sm text-gray-500">{selectedUserLogs.user.username} - {selectedUserLogs.user.email}</p>
                </div>
                <button
                  onClick={() => setShowLogsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Login Records */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <Smartphone className="w-4 h-4" />
                    <span>登录记录</span>
                  </h4>
                  {selectedUserLogs.records.length > 0 ? (
                    <div className="space-y-3">
                      {selectedUserLogs.records.map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              record.isSuccessful ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {record.isSuccessful ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {record.deviceName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {record.location} · {record.ipAddress}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900">{formatDate(record.loginTime)}</p>
                            {record.failureReason && (
                              <p className="text-xs text-red-500">{record.failureReason}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">暂无登录记录</p>
                    </div>
                  )}
                </div>

                {/* Operation Logs */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>操作记录</span>
                  </h4>
                  {selectedUserLogs.logs.length > 0 ? (
                    <div className="space-y-3">
                      {selectedUserLogs.logs.map((log) => (
                        <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
                              log.action === 'create' ? 'bg-green-100 text-green-700' :
                              log.action === 'update' ? 'bg-blue-100 text-blue-700' :
                              log.action === 'delete' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {log.action === 'create' ? '创建' :
                               log.action === 'update' ? '更新' :
                               log.action === 'delete' ? '删除' : log.action}
                            </span>
                            <span className="text-xs text-gray-400">{formatDate(log.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-600">{log.details}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">暂无操作记录</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
